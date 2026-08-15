# Code Battle

Practice coding interviews by competing against real developers — face off
against a friend on the **same problem**, under the **same clock**, in
**real-time across devices**.

## Stack

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**
- **Supabase** — Auth, PostgreSQL, Realtime, Row Level Security
- **Monaco Editor** (`@monaco-editor/react`)

## Auth: username + password only

Supabase Auth requires an email field, but we never send real emails. Each
username maps to a **synthetic email** (`username@codebattle.local`) with a
random password. The user only ever types a **username + password**. This uses
**zero** email quota on the free tier.

Sessions are held in **httpOnly cookies** via `@supabase/ssr` — no
`localStorage`, no XSS token theft.

## Security model

- **RLS everywhere.** Users can only read their own data and the data of
  matches they participate in.
- **Server-authoritative outcomes.** ELO, XP, and the winner are written only
  by `SECURITY DEFINER` Postgres functions (`finalize_match`), never by the
  client. The client cannot mark itself as winner or edit its ELO/XP.
- **Race-safe submissions.** A unique partial index allows only one final
  submission per player per match, so simultaneous submits can't double-score.
- **Sandboxed code execution.** User code runs in an isolated `new Function`
  scope (no DOM, no localStorage, no network) with a per-test timeout.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` from `.env.example` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. In the Supabase SQL editor, run in order:
   1. `db/schema.sql`
   2. `db/functions.sql`
   3. `db/seed.sql`
4. In Supabase Auth settings, **disable email confirmation** (so signup
   returns a session immediately) and set the site URL to your app URL.
5. Run:
   ```bash
   npm run dev
   ```

## How a battle works

1. Host creates a room (picks a problem) → gets a 6-char code.
2. Guest joins with the code from anywhere.
3. Host starts the match → 5s countdown → both players get the same problem.
4. Both write code in Monaco, run sample tests, and submit.
5. When both have submitted, the server computes the winner (correctness,
   then time) and calls `finalize_match` to update ELO, XP, and the ratings
   ledger atomically.
6. Both players see the result screen.

## Routes

- `/` — landing
- `/signup`, `/login` — username + password auth
- `/dashboard` — stats, problems, recent matches
- `/play` — create / join a room
- `/battle/[code]` — the realtime battle
- `/problem/[slug]` — problem detail
- `/profile` — stats + rating history
- `/leaderboard` — all players by ELO

## Folder structure

```
src/
  app/
    auth/actions.ts        # username+password auth server actions
    match/actions.ts       # create/join/start/submit/finalize server actions
    battle/[code]/page.tsx # realtime battle UI
    dashboard, profile, leaderboard, play, problem, login, signup
  lib/
    supabase/              # server + browser clients, middleware (httpOnly cookies)
    auth/session.ts        # server-side auth guards
    battle/client-data.ts  # realtime subscriptions + client queries
    code/runner.ts         # sandboxed solution test-runner
    problems/              # server + client problem data access
db/
  schema.sql               # tables + RLS
  functions.sql            # SECURITY DEFINER: transitions, ELO/XP finalize
  seed.sql                 # problems + test cases
```

## Roadmap

- More problems across categories and difficulties
- TypeScript / Python support in the editor
- Quick match (ELO-banded matchmaking)
- Daily challenge
- Match timeout enforcement + reconnect handling
- AI-generated battle review
