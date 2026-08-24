import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listProblems } from "@/lib/problems/data";
import Link from "next/link";
import ProblemsGrid from "@/components/ProblemsGrid";
import LogoMark from "@/components/LogoMark";

export const metadata = { title: "Dashboard — CodeBattle" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("id, username, elo, xp, level, wins, losses, current_streak, best_streak, problems_solved, role")
    .eq("id", user.userId)
    .single();

  const problems = await listProblems();

  const { data: recentMatches } = await supabase
    .from("matches")
    .select(
      "id, room_code, status, winner_id, created_at, problem_id, " +
        "problems(title), " +
        "match_problems(sort_order, problems(title)), " +
        "match_players!inner(xp_gained, elo_after, player_id), " +
        "submissions(tests_passed, tests_total)"
    )
    .eq("match_players.player_id", user.userId)
    .eq("submissions.player_id", user.userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const matches = (recentMatches ?? []) as unknown as {
    id: string; room_code: string | null; status: string; winner_id: string | null;
    created_at: string; problem_id: string; problems: { title: string } | null;
    match_problems: { sort_order: number | null; problems: { title: string } | null }[];
    match_players: { xp_gained: number | null; elo_after: number | null; player_id: string }[];
    submissions: { tests_passed: number | null; tests_total: number | null }[];
  }[];

  return (
    <div className="w-full min-h-screen px-6 sm:px-10 lg:px-14">
      <div className="w-full px-6 sm:px-10 lg:px-14 py-8">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-neutral-900/60 p-8 sm:p-12 mb-8"
          style={{ boxShadow: "0 0 40px rgba(34,197,94,0.08)" }}
        >
          <div className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full bg-emerald-500/10 blur-[110px]" />
          <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-emerald-400/5 blur-[100px]" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <span className="text-3xl font-extrabold tracking-tight">
                <span className="text-neutral-100">Code</span>
                <span className="text-emerald-400">Battle</span>
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">
                Welcome back,{" "}
                <span className="text-emerald-400" style={{ textShadow: "0 0 30px rgba(34,197,94,0.35)" }}>
                  {profile?.username ?? user.username}
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-neutral-400 leading-relaxed">
                Level {profile?.level ?? 1} ·{" "}
                <span className="text-emerald-400 font-semibold">{profile?.elo ?? 1200} ELO</span> · Challenge developers
                to real-time coding duels — same problem, same clock, only the fastest mind wins.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row shrink-0 gap-3">
              <Link
                href="/play"
                className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-105 text-center whitespace-nowrap"
                style={{ boxShadow: "0 0 30px rgba(34,197,94,0.2)" }}
              >
                ⚔️ Battle Now
              </Link>
              <Link
                href="/leaderboard"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-xl border border-emerald-500/30 text-emerald-400 transition-all duration-300 hover:bg-emerald-500/10 hover:scale-105 text-center whitespace-nowrap"
              >
                🏆 Leaderboard
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        {profile && (
          <section className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <Stat label="ELO" value={profile.elo} color="#22c55e" />
            <Stat label="Level" value={profile.level} color="#f59e0b" />
            <Stat label="XP" value={profile.xp} color="#22c55e" />
            <Stat label="Wins" value={profile.wins} color="#f59e0b" />
          </section>
        )}

        {/* Problems Grid */}
        <ProblemsGrid problems={problems} />

        {/* Recent Battles */}
        {matches.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-500">Recent Battles</h2>
            <div className="space-y-2">
              {matches.map((m) => {
                const mp = m.match_players?.[0];
                const won = m.winner_id === user.userId;
                const passed = (m.submissions ?? []).reduce((a, s) => a + (s.tests_passed ?? 0), 0);
                const totalTests = (m.submissions ?? []).reduce((a, s) => a + (s.tests_total ?? 0), 0);
                const titles = (m.match_problems ?? [])
                  .slice()
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((p) => p.problems?.title)
                  .filter(Boolean) as string[];
                const solo = m.room_code === null;
                return (
                  <div key={m.id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-4 transition-all duration-200 hover:border-neutral-700">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${solo ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20"}`}>
                          {solo ? "SOLO" : "BATTLE"}
                        </span>
                        <span className="truncate font-medium text-neutral-200" title={titles.length > 0 ? titles.join(" · ") : undefined}>
                          {titles.length > 1
                            ? `${titles[0]} +${titles.length - 1} more`
                            : titles[0] ?? m.problems?.title ?? "Unknown"}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-neutral-500">{new Date(m.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {totalTests > 0 && <span className="text-sm text-neutral-400">{passed}/{totalTests}</span>}
                      {mp?.xp_gained != null && <span className="text-sm font-bold text-emerald-400">+{mp.xp_gained} XP</span>}
                      {!solo && mp?.elo_after != null && (
                        <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${won ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20"}`}>
                          {won ? "WIN" : "LOSS"}
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
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 transition-all duration-200 hover:border-neutral-700">
      <p className="text-3xl font-extrabold" style={{ color, textShadow: `0 0 20px ${color}40` }}>{value}</p>
      <p className="mt-1.5 text-xs uppercase tracking-wide text-neutral-500 font-medium">{label}</p>
    </div>
  );
}
