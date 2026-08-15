import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import { listProblems } from "@/lib/problems/data";
import Link from "next/link";

export const metadata = { title: "Dashboard — Code Battle" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("id, username, elo, xp, level, wins, losses, current_streak, best_streak, problems_solved")
    .eq("id", user.userId)
    .single();

  const problems = await listProblems();

  const { data: recentMatches } = await supabase
    .from("matches")
    .select(
      "id, room_code, status, winner_id, created_at, problem_id, " +
        "problems(title), " +
        "match_players!inner(xp_gained, elo_after, player_id), " +
        "submissions(tests_passed, tests_total)"
    )
    .eq("match_players.player_id", user.userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const matches = (recentMatches ?? []) as unknown as {
    id: string;
    room_code: string | null;
    status: string;
    winner_id: string | null;
    created_at: string;
    problem_id: string;
    problems: { title: string } | null;
    match_players: { xp_gained: number | null; elo_after: number | null; player_id: string }[];
    submissions: { tests_passed: number | null; tests_total: number | null }[];
  }[];

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, <span className="text-emerald-400">{profile?.username ?? user.username}</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Level {profile?.level ?? 1} · {profile?.elo ?? 1200} ELO
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/history"
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
          >
            History
          </Link>
          <Link
            href="/profile"
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Profile
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Leaderboard
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      {profile && (
        <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="ELO" value={profile.elo} accent />
          <Stat label="Level" value={profile.level} />
          <Stat label="XP" value={profile.xp} />
          <Stat label="Wins" value={profile.wins} />
        </section>
      )}

      <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
        <h2 className="text-lg font-semibold">Battle a friend</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Create a room, share the code, and your opponent joins from anywhere.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/play"
            className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
          >
            Enter arena
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Problems</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {problems.map((p) => (
            <Link
              key={p.id}
              href={`/problem/${p.slug}`}
              className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 transition-colors hover:border-neutral-600"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-200">{p.title}</span>
                <DifficultyBadge d={p.difficulty} />
              </div>
              <p className="mt-2 text-sm text-neutral-500">{p.category}</p>
            </Link>
          ))}
        </div>
      </section>

      {matches.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Recent battles</h2>
          <div className="space-y-2">
            {matches.map((m) => {
              const mp = m.match_players?.[0];
              const won = m.winner_id === user.userId;
              const sub = m.submissions?.[0];
              const solo = m.room_code === null;
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          solo
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {solo ? "SOLO" : "BATTLE"}
                      </span>
                      <span className="truncate font-medium text-neutral-200">
                        {m.problems?.title ?? "Unknown problem"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {sub && (
                      <span className="text-neutral-400">
                        {sub.tests_passed ?? 0}/{sub.tests_total ?? 0}
                      </span>
                    )}
                    {mp?.xp_gained != null && (
                      <span className="text-emerald-400">+{mp.xp_gained} XP</span>
                    )}
                    {!solo && mp?.elo_after != null && (
                      <span className={won ? "text-emerald-400" : "text-red-400"}>
                        {won ? "W" : "L"}
                      </span>
                    )}
                    {solo && (
                      <span className="text-emerald-400">
                        {mp?.xp_gained && mp.xp_gained > 0 ? "Solved" : "Attempted"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <p className={`text-2xl font-bold ${accent ? "text-emerald-400" : "text-neutral-50"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{label}</p>
    </div>
  );
}

function DifficultyBadge({ d }: { d: string }) {
  const color =
    d === "easy"
      ? "bg-emerald-500/15 text-emerald-400"
      : d === "medium"
      ? "bg-amber-500/15 text-amber-400"
      : "bg-red-500/15 text-red-400";
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {d}
    </span>
  );
}
