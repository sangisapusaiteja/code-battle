-- ============================================================
-- CODE BATTLE â€” Database schema (Supabase PostgreSQL)
-- Custom username + password auth. No Supabase Auth, no email.
-- Tables for the code battle app only.
-- ============================================================

-- ------------------------------------------------------------------
-- users
-- The single identity table. Password is bcrypt-hashed.
-- elo / xp / wins / losses / level are SERVER-WRITTEN ONLY.
-- ------------------------------------------------------------------
create table if not exists public.users (
  id                uuid primary key default gen_random_uuid(),
  username          text unique not null,
  password_hash     text not null,
  avatar_url        text,
  xp                int  not null default 0,
  level             int  not null default 1,
  elo               int  not null default 1200,
  wins              int  not null default 0,
  losses            int  not null default 0,
  current_streak    int  not null default 0,
  best_streak       int  not null default 0,
  last_solve_date   date,
  problems_solved   int  not null default 0,
  avg_solve_seconds int  not null default 0,
  best_category     text,
  role              text not null default 'user'
                      check (role in ('user','admin')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists users_elo_idx on public.users (elo desc);

-- ------------------------------------------------------------------
-- problems
-- ------------------------------------------------------------------
create table if not exists public.cb_problems (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  title             text not null,
  description       text not null,
  difficulty        text not null check (difficulty in ('easy','medium','hard')),
  category          text not null,
  constraints       text,
  starter_code      text not null,
  function_name     text not null,
  created_at        timestamptz not null default now()
);

create index if not exists problems_difficulty_idx on public.cb_problems (difficulty);
create index if not exists problems_category_idx on public.cb_problems (category);

-- ------------------------------------------------------------------
-- problem_test_cases
-- ------------------------------------------------------------------
create table if not exists public.cb_problem_test_cases (
  id               uuid primary key default gen_random_uuid(),
  problem_id       uuid not null references public.cb_problems (id) on delete cascade,
  input            jsonb not null,
  expected_output  jsonb not null,
  is_sample        boolean not null default false,
  sort_order       int not null default 0
);

create index if not exists problem_test_cases_problem_idx
  on public.cb_problem_test_cases (problem_id);

-- ------------------------------------------------------------------
-- matches
-- status is the battle state machine. winner_id is SERVER-WRITTEN ONLY.
-- ------------------------------------------------------------------
create table if not exists public.cb_matches (
  id               uuid primary key default gen_random_uuid(),
  problem_id       uuid not null references public.cb_problems (id),
  status           text not null default 'waiting' check (status in (
                     'waiting','matched','countdown','active',
                     'player_submitted','evaluating','finished','cancelled'
                   )),
  room_code        text unique,
  starts_at        timestamptz,
  duration_seconds int not null default 600,
  current_problem_index int not null default 0,
  winner_id        uuid references public.users (id),
  created_at       timestamptz not null default now(),
  finished_at      timestamptz
);

create index if not exists matches_status_idx on public.cb_matches (status);
create index if not exists matches_room_code_idx on public.cb_matches (room_code);

-- ------------------------------------------------------------------
-- match_problems
-- The ordered list of problems in a match (supports multi-problem battles).
-- ------------------------------------------------------------------
create table if not exists public.cb_match_problems (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.cb_matches (id) on delete cascade,
  problem_id uuid not null references public.cb_problems (id),
  sort_order int not null default 0,
  unique (match_id, problem_id)
);

create index if not exists match_problems_match_idx on public.cb_match_problems (match_id);

-- ------------------------------------------------------------------
-- match_players
-- elo_before/elo_after/xp_gained are SERVER-WRITTEN ONLY.
-- ------------------------------------------------------------------
create table if not exists public.cb_match_players (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.cb_matches (id) on delete cascade,
  player_id  uuid not null references public.users (id) on delete cascade,
  is_host    boolean not null default false,
  ready      boolean not null default false,
  elo_before int,
  elo_after  int,
  xp_gained  int,
  finished_at timestamptz,
  current_problem_index int not null default 0,
  problem_started_at timestamptz,
  created_at timestamptz not null default now(),
  unique (match_id, player_id)
);

create index if not exists match_players_match_idx on public.cb_match_players (match_id);
create index if not exists match_players_player_idx on public.cb_match_players (player_id);

-- ------------------------------------------------------------------
-- submissions
-- unique partial index makes duplicate final submits a no-op (race-safe).
-- ------------------------------------------------------------------
create table if not exists public.cb_submissions (
  id                uuid primary key default gen_random_uuid(),
  match_id          uuid not null references public.cb_matches (id) on delete cascade,
  player_id         uuid not null references public.users (id) on delete cascade,
  problem_id        uuid not null references public.cb_problems (id),
  source_code       text not null,
  language          text not null,
  tests_passed      int,
  tests_total       int,
  is_final          boolean not null default false,
  execution_time_ms int,
  created_at        timestamptz not null default now()
);

create unique index if not exists submissions_one_final_per_player
  on public.cb_submissions (match_id, player_id, problem_id) where (is_final);

create index if not exists submissions_match_idx on public.cb_submissions (match_id, player_id);

-- ------------------------------------------------------------------
-- ratings â€” immutable ELO ledger. INSERT-ONLY, server-written.
-- ------------------------------------------------------------------
create table if not exists public.cb_ratings (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references public.users (id) on delete cascade,
  match_id    uuid references public.cb_matches (id) on delete set null,
  elo_before  int not null,
  elo_after   int not null,
  delta       int not null,
  created_at  timestamptz not null default now()
);

create index if not exists ratings_player_idx on public.cb_ratings (player_id, created_at desc);

-- ------------------------------------------------------------------
-- updated_at trigger function (shared across tables).
-- ------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- NOTE: With custom auth, the client uses the anon key. RLS must
-- allow the operations the app performs. Since the app's server
-- actions run with the anon key too, we open the needed tables to
-- anon. Passwords are never exposed (select excludes password_hash
-- in the app, and we add a column-level grant below).
-- ============================================================

alter table public.users             enable row level security;
alter table public.cb_problems          enable row level security;
alter table public.cb_problem_test_cases enable row level security;
alter table public.cb_matches           enable row level security;
alter table public.cb_match_problems    enable row level security;
alter table public.cb_match_players     enable row level security;
alter table public.cb_submissions       enable row level security;
alter table public.cb_ratings           enable row level security;

-- Problems / test cases: publicly readable. Inserts are allowed so the
-- admin API (which runs with the anon key) can add content. The admin
-- check happens in the server action (requireAdmin).
create policy "problems readable by all"
  on public.cb_problems for select to anon using (true);
create policy "problems insertable by all"
  on public.cb_problems for insert to anon with check (true);
create policy "test cases readable by all"
  on public.cb_problem_test_cases for select to anon using (true);
create policy "test cases insertable by all"
  on public.cb_problem_test_cases for insert to anon with check (true);

-- users: readable by all (for leaderboard/opponent info), but password
-- hash is protected by column-level privileges (see below).
create policy "users readable by all"
  on public.users for select to anon using (true);

-- users: anyone may insert (signup). Server actions handle hashing.
create policy "users can sign up"
  on public.users for insert to anon with check (true);

-- matches: readable by all (participants + result screens).
create policy "matches readable by all"
  on public.cb_matches for select to anon using (true);
create policy "users can create a match"
  on public.cb_matches for insert to anon with check (true);

-- match_problems: readable by all; anyone may insert (host creates them).
create policy "match problems readable by all"
  on public.cb_match_problems for select to anon using (true);
create policy "users can add match problems"
  on public.cb_match_problems for insert to anon with check (true);

-- match_players: readable by all; anyone may insert their own row.
create policy "match players readable by all"
  on public.cb_match_players for select to anon using (true);
create policy "users can join a match"
  on public.cb_match_players for insert to anon with check (true);

-- submissions: readable by all; anyone may insert.
create policy "submissions readable by all"
  on public.cb_submissions for select to anon using (true);
create policy "users can submit"
  on public.cb_submissions for insert to anon with check (true);

-- ratings: readable by all.
create policy "ratings readable by all"
  on public.cb_ratings for select to anon using (true);

-- Protect the password hash: revoke select on the column from anon.
-- ------------------------------------------------------------------
revoke select (password_hash) on public.users from anon;

-- ============================================================
-- REALTIME — broadcast battle changes to connected clients.
-- Without this, postgres_changes subscriptions receive nothing
-- and players must refresh manually to see each other's moves.
-- ============================================================
do $$
begin
  alter publication supabase_realtime add table public.cb_matches;
  alter publication supabase_realtime add table public.cb_match_players;
  alter publication supabase_realtime add table public.cb_submissions;
exception
  when duplicate_object then null; -- already a member
end
$$;


-- ============================================================
-- GOOGLE OAUTH — link Google identities to the shared users table.
-- ============================================================
alter table public.users add column if not exists google_id text unique;


-- ============================================================
-- AUTH PROVIDER — how the account signs in ('password' | 'google').
-- ============================================================
alter table public.users add column if not exists auth_provider text not null default 'password';
update public.users set auth_provider = 'google' where google_id is not null and auth_provider = 'password';


-- ============================================================
-- GENERATED PASSWORD — plaintext kept only until the user sets
-- their own password (Google-auth accounts).
-- ============================================================
alter table public.users add column if not exists generated_password text;
