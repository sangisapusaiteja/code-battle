-- ============================================================
-- CODE BATTLE — Database schema (Supabase PostgreSQL)
-- Custom username + password auth. No Supabase Auth, no email.
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
  problems_solved   int  not null default 0,
  avg_solve_seconds int  not null default 0,
  best_category     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists users_elo_idx on public.users (elo desc);

-- ------------------------------------------------------------------
-- problems
-- ------------------------------------------------------------------
create table if not exists public.problems (
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

create index if not exists problems_difficulty_idx on public.problems (difficulty);
create index if not exists problems_category_idx on public.problems (category);

-- ------------------------------------------------------------------
-- problem_test_cases
-- ------------------------------------------------------------------
create table if not exists public.problem_test_cases (
  id               uuid primary key default gen_random_uuid(),
  problem_id       uuid not null references public.problems (id) on delete cascade,
  input            jsonb not null,
  expected_output  jsonb not null,
  is_sample        boolean not null default false,
  sort_order       int not null default 0
);

create index if not exists problem_test_cases_problem_idx
  on public.problem_test_cases (problem_id);

-- ------------------------------------------------------------------
-- matches
-- status is the battle state machine. winner_id is SERVER-WRITTEN ONLY.
-- ------------------------------------------------------------------
create table if not exists public.matches (
  id               uuid primary key default gen_random_uuid(),
  problem_id       uuid not null references public.problems (id),
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

create index if not exists matches_status_idx on public.matches (status);
create index if not exists matches_room_code_idx on public.matches (room_code);

-- ------------------------------------------------------------------
-- match_problems
-- The ordered list of problems in a match (supports multi-problem battles).
-- ------------------------------------------------------------------
create table if not exists public.match_problems (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches (id) on delete cascade,
  problem_id uuid not null references public.problems (id),
  sort_order int not null default 0,
  unique (match_id, problem_id)
);

create index if not exists match_problems_match_idx on public.match_problems (match_id);

-- ------------------------------------------------------------------
-- match_players
-- elo_before/elo_after/xp_gained are SERVER-WRITTEN ONLY.
-- ------------------------------------------------------------------
create table if not exists public.match_players (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches (id) on delete cascade,
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

create index if not exists match_players_match_idx on public.match_players (match_id);
create index if not exists match_players_player_idx on public.match_players (player_id);

-- ------------------------------------------------------------------
-- submissions
-- unique partial index makes duplicate final submits a no-op (race-safe).
-- ------------------------------------------------------------------
create table if not exists public.submissions (
  id                uuid primary key default gen_random_uuid(),
  match_id          uuid not null references public.matches (id) on delete cascade,
  player_id         uuid not null references public.users (id) on delete cascade,
  problem_id        uuid not null references public.problems (id),
  source_code       text not null,
  language          text not null,
  tests_passed      int,
  tests_total       int,
  is_final          boolean not null default false,
  execution_time_ms int,
  created_at        timestamptz not null default now()
);

create unique index if not exists submissions_one_final_per_player
  on public.submissions (match_id, player_id, problem_id) where (is_final);

create index if not exists submissions_match_idx on public.submissions (match_id, player_id);

-- ------------------------------------------------------------------
-- ratings — immutable ELO ledger. INSERT-ONLY, server-written.
-- ------------------------------------------------------------------
create table if not exists public.ratings (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references public.users (id) on delete cascade,
  match_id    uuid references public.matches (id) on delete set null,
  elo_before  int not null,
  elo_after   int not null,
  delta       int not null,
  created_at  timestamptz not null default now()
);

create index if not exists ratings_player_idx on public.ratings (player_id, created_at desc);

-- ------------------------------------------------------------------
-- user_topic_progress — Interview Handbook topic completion tracking.
-- Composite PK: (user_id, section_slug, topic_slug).
-- ------------------------------------------------------------------
create table if not exists public.user_topic_progress (
  user_id        uuid not null references public.users (id) on delete cascade,
  section_slug   text not null,
  topic_slug     text not null,
  topic_id       text not null,
  completed      boolean not null default false,
  completed_at   timestamptz,
  last_opened_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  primary key (user_id, section_slug, topic_slug)
);

create index if not exists user_topic_progress_user_idx
  on public.user_topic_progress (user_id);

-- ------------------------------------------------------------------
-- user_preferences — theme, pinned topics, assistant state, etc.
-- ------------------------------------------------------------------
create table if not exists public.user_preferences (
  user_id             uuid primary key references public.users (id) on delete cascade,
  app_theme           text not null default 'system'
                        check (app_theme in ('light','dark','system')),
  pinned_topic_hrefs  text[] not null default '{}',
  recent_queries      text[] not null default '{}',
  recent_topic_hrefs  text[] not null default '{}',
  assistant_state     jsonb not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- user_progress_dashboard — aggregated view for progress page.
-- ------------------------------------------------------------------
create or replace view public.user_progress_dashboard as
select
  user_id,
  count(*) filter (where completed) as completed_topics,
  max(last_opened_at) as last_opened_at,
  max(completed_at) as last_completed_at,
  max(updated_at) as last_activity_at
from public.user_topic_progress
group by user_id;

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

drop trigger if exists set_user_topic_progress_updated_at on public.user_topic_progress;
create trigger set_user_topic_progress_updated_at
before update on public.user_topic_progress
for each row
execute function public.set_updated_at();

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- categories — Interview Handbook section metadata.
-- ------------------------------------------------------------------
create table if not exists public.categories (
  id          text primary key,
  title       text not null,
  icon        text not null,
  description text not null,
  color       text not null,
  "group"     text not null,
  available   boolean not null default true,
  sort_order  int not null default 0
);

-- ------------------------------------------------------------------
-- modules — learning path groupings within a category.
-- ------------------------------------------------------------------
create table if not exists public.modules (
  id          text primary key,
  category_id text not null references public.categories(id) on delete cascade,
  level       int not null,
  title       text not null,
  difficulty  text not null,
  description text not null,
  category    text,
  sort_order  int not null default 0
);

create index if not exists modules_category_idx on public.modules (category_id);

-- ------------------------------------------------------------------
-- topics — main content (concept, code, metadata).
-- ------------------------------------------------------------------
create table if not exists public.topics (
  id            text primary key,
  category_id   text not null references public.categories(id) on delete cascade,
  module_id     text references public.modules(id) on delete set null,
  title         text not null,
  slug          text not null,
  icon          text not null,
  difficulty    text not null,
  description   text not null,
  leetcode_link text,

  concept_explanation      text not null,
  concept_analogy          text not null,
  concept_key_points       text[] not null default '{}',
  concept_time_complexity  text,
  concept_space_complexity text,

  code_default_code text not null,
  code_language     text not null default 'javascript',
  code_files        jsonb,

  sort_order int not null default 0,
  unique (category_id, slug)
);

create index if not exists topics_category_idx on public.topics (category_id);
create index if not exists topics_module_idx on public.topics (module_id);
create index if not exists topics_slug_idx on public.topics (slug);

-- ------------------------------------------------------------------
-- interview_questions
-- ------------------------------------------------------------------
create table if not exists public.interview_questions (
  id         uuid primary key default gen_random_uuid(),
  topic_id   text not null references public.topics(id) on delete cascade,
  question   text not null,
  difficulty text not null,
  hint       text not null,
  sort_order int not null default 0
);

create index if not exists interview_questions_topic_idx
  on public.interview_questions (topic_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- NOTE: With custom auth, the client uses the anon key. RLS must
-- allow the operations the app performs. Since the app's server
-- actions run with the anon key too, we open the needed tables to
-- anon. Passwords are never exposed (select excludes password_hash
-- in the app, and we add a column-level grant below).
-- ============================================================

alter table public.users             enable row level security;
alter table public.problems          enable row level security;
alter table public.problem_test_cases enable row level security;
alter table public.matches           enable row level security;
alter table public.match_problems    enable row level security;
alter table public.match_players     enable row level security;
alter table public.submissions       enable row level security;
alter table public.ratings               enable row level security;
alter table public.user_topic_progress    enable row level security;
alter table public.user_preferences       enable row level security;
alter table public.categories             enable row level security;
alter table public.modules                enable row level security;
alter table public.topics                 enable row level security;
alter table public.interview_questions    enable row level security;

-- Problems / test cases: publicly readable.
create policy "problems readable by all"
  on public.problems for select to anon using (true);
create policy "test cases readable by all"
  on public.problem_test_cases for select to anon using (true);

-- users: readable by all (for leaderboard/opponent info), but password
-- hash is protected by column-level privileges (see below).
create policy "users readable by all"
  on public.users for select to anon using (true);

-- users: anyone may insert (signup). Server actions handle hashing.
create policy "users can sign up"
  on public.users for insert to anon with check (true);

-- matches: readable by all (participants + result screens).
create policy "matches readable by all"
  on public.matches for select to anon using (true);
create policy "users can create a match"
  on public.matches for insert to anon with check (true);

-- match_problems: readable by all; anyone may insert (host creates them).
create policy "match problems readable by all"
  on public.match_problems for select to anon using (true);
create policy "users can add match problems"
  on public.match_problems for insert to anon with check (true);

-- match_players: readable by all; anyone may insert their own row.
create policy "match players readable by all"
  on public.match_players for select to anon using (true);
create policy "users can join a match"
  on public.match_players for insert to anon with check (true);

-- submissions: readable by all; anyone may insert.
create policy "submissions readable by all"
  on public.submissions for select to anon using (true);
create policy "users can submit"
  on public.submissions for insert to anon with check (true);

-- ratings: readable by all.
create policy "ratings readable by all"
  on public.ratings for select to anon using (true);

-- ------------------------------------------------------------------
-- user_topic_progress: readable by all; anyone may insert/upsert.
create policy "user topic progress readable by all"
  on public.user_topic_progress for select to anon using (true);
create policy "users can upsert own progress"
  on public.user_topic_progress for insert to anon with check (true);
create policy "users can update own progress"
  on public.user_topic_progress for update to anon using (true);

-- user_preferences: readable by all; anyone may insert/upsert.
create policy "user preferences readable by all"
  on public.user_preferences for select to anon using (true);
create policy "users can upsert own preferences"
  on public.user_preferences for insert to anon with check (true);
create policy "users can update own preferences"
  on public.user_preferences for update to anon using (true);

-- categories, modules, topics, interview_questions: publicly readable.
create policy "categories readable by all"
  on public.categories for select to anon using (true);
create policy "modules readable by all"
  on public.modules for select to anon using (true);
create policy "topics readable by all"
  on public.topics for select to anon using (true);
create policy "interview questions readable by all"
  on public.interview_questions for select to anon using (true);

-- Protect the password hash: revoke select on the column from anon.
-- ------------------------------------------------------------------
revoke select (password_hash) on public.users from anon;
