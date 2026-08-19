-- ============================================================
-- CODE BATTLE — Server-authoritative functions
-- SECURITY DEFINER: the ONLY way the server writes match outcomes,
-- ELO, XP, and winner fields. Run after schema.sql.
-- ============================================================

-- ------------------------------------------------------------------
-- Fetch a user's password hash for login verification.
-- SECURITY DEFINER so the hash is never readable by the anon client.
-- ------------------------------------------------------------------
create or replace function public.get_password_hash(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select password_hash from public.users where username = p_username;
$$;

-- ------------------------------------------------------------------
-- Transition a match's state machine. Only valid transitions allowed.
-- ------------------------------------------------------------------
create or replace function public.transition_match(
  p_match_id uuid,
  p_from_status text,
  p_to_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.matches
     set status = p_to_status,
         starts_at = case when p_to_status = 'active'
                          then coalesce(starts_at, now()) end,
         finished_at = case when p_to_status in ('finished','cancelled')
                            then now() end
   where id = p_match_id
     and status = p_from_status;
end;
$$;

-- ------------------------------------------------------------------
-- Start the per-player timer for all players in a match.
-- SECURITY DEFINER so the anon client cannot UPDATE match_players directly.
-- ------------------------------------------------------------------
create or replace function public.start_player_timers(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.match_players
     set problem_started_at = now()
   where match_id = p_match_id;
end;
$$;

-- ------------------------------------------------------------------
-- Advance a player's progress in a match.
-- SECURITY DEFINER so the anon client cannot directly UPDATE match_players
-- (which would let it forge elo/xp). Only the server action calls this.
-- p_next_index: the player's new current_problem_index (pass NULL to keep).
-- p_finished:   when true, stamp finished_at = now().
-- ------------------------------------------------------------------
create or replace function public.advance_player(
  p_match_id uuid,
  p_player_id uuid,
  p_next_index int,
  p_finished boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.match_players
     set current_problem_index = coalesce(p_next_index, current_problem_index),
         finished_at = case when p_finished then now() else finished_at end
   where match_id = p_match_id
     and player_id = p_player_id;
end;
$$;

-- ------------------------------------------------------------------
-- Award XP to a user (solo practice). SECURITY DEFINER so the anon client
-- cannot directly UPDATE users (which would let it forge xp/elo).
-- Also maintains current_streak / best_streak based on last_solve_date.
-- ------------------------------------------------------------------
create or replace function public.award_solo_xp(
  p_user_id uuid,
  p_xp int,
  p_problems_solved int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := current_date;
  last_solve date;
  new_streak int;
begin
  select last_solve_date into last_solve from public.users where id = p_user_id;

  if last_solve is null or last_solve < today - 1 then
    new_streak := 1;
  elsif last_solve = today - 1 then
    new_streak := coalesce(
      (select current_streak from public.users where id = p_user_id), 0
    ) + 1;
  else -- last_solve = today
    new_streak := coalesce(
      (select current_streak from public.users where id = p_user_id), 0
    );
  end if;

  update public.users
     set xp = xp + p_xp,
         problems_solved = problems_solved + p_problems_solved,
         current_streak = new_streak,
         best_streak = greatest(best_streak, new_streak),
         last_solve_date = today,
         updated_at = now()
   where id = p_user_id;
end;
$$;

-- ------------------------------------------------------------------
-- Mark a match finished with no winner (a draw).
-- SECURITY DEFINER so the anon client cannot forge outcomes.
-- ------------------------------------------------------------------
create or replace function public.finish_match_draw(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.matches where id = p_match_id and status = 'finished') then
    return;
  end if;
  update public.matches
     set status = 'finished',
         winner_id = null,
         finished_at = now()
   where id = p_match_id;
end;
$$;

-- ------------------------------------------------------------------
-- Finalize a battle and compute ELO / XP atomically.
-- Idempotent: safe to run exactly once. Winner is passed by the server
-- (best correctness, then time). K=32 two-player Elo.
-- ------------------------------------------------------------------
create or replace function public.finalize_match(
  p_match_id uuid,
  p_winner_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r_match      record;
  r_players    record;
  elo_winner   int;
  elo_loser    int;
  exp_w        numeric;
  exp_l        numeric;
  delta_w      int;
  delta_l      int;
  xp_gain      int := 100;
  v_loser_id   uuid;
  today        date := current_date;
  last_solve   date;
  new_streak   int;
begin
  -- Guard: only finalize once.
  if exists (select 1 from public.matches where id = p_match_id and status = 'finished') then
    return;
  end if;

  select * into r_match from public.matches where id = p_match_id for update;

  -- Determine loser: the other participant.
  for r_players in
    select player_id, elo_before
      from public.match_players
     where match_id = p_match_id
  loop
    if r_players.player_id <> p_winner_id then
      v_loser_id := r_players.player_id;
    end if;
  end loop;

  select elo into elo_winner from public.users where id = p_winner_id;
  select elo into elo_loser  from public.users where id = v_loser_id;

  if elo_winner is null then elo_winner := 1200; end if;
  if elo_loser  is null then elo_loser  := 1200; end if;

  exp_w := 1.0 / (1.0 + power(10.0, (elo_loser - elo_winner)::numeric / 400.0));
  exp_l := 1.0 / (1.0 + power(10.0, (elo_winner - elo_loser)::numeric / 400.0));

  delta_w := round(32 * (1 - exp_w))::int;
  delta_l := round(32 * (0 - exp_l))::int;

  -- Write ELO deltas + XP to match_players (server only).
  update public.match_players
     set elo_after = elo_winner + delta_w,
         xp_gained = xp_gain
   where match_id = p_match_id and player_id = p_winner_id;

  update public.match_players
     set elo_after = elo_loser + delta_l,
         xp_gained = 10
   where match_id = p_match_id and player_id = v_loser_id;

  -- Append to the immutable ratings ledger.
  insert into public.ratings (player_id, match_id, elo_before, elo_after, delta) values
    (p_winner_id, p_match_id, elo_winner, elo_winner + delta_w, delta_w),
    (v_loser_id,  p_match_id, elo_loser,  elo_loser  + delta_l, delta_l);

  -- Update aggregate user columns.
  select last_solve_date into last_solve from public.users where id = p_winner_id;
  if last_solve is null or last_solve < today - 1 then
    new_streak := 1;
  elsif last_solve = today - 1 then
    new_streak := coalesce(
      (select current_streak from public.users where id = p_winner_id), 0
    ) + 1;
  else
    new_streak := coalesce(
      (select current_streak from public.users where id = p_winner_id), 0
    );
  end if;

  update public.users
     set elo = elo_winner + delta_w,
         xp = xp + xp_gain,
         wins = wins + 1,
         problems_solved = problems_solved + 1,
         current_streak = new_streak,
         best_streak = greatest(best_streak, new_streak),
         last_solve_date = today,
         updated_at = now()
   where id = p_winner_id;

  update public.users
     set elo = elo_loser + delta_l,
         xp = xp + 10,
         losses = losses + 1,
         updated_at = now()
   where id = v_loser_id;

  update public.matches
     set status = 'finished',
         winner_id = p_winner_id,
         finished_at = now()
   where id = p_match_id;
end;
$$;
