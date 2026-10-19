import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listProblems } from "@/lib/problems/data";
import Link from "next/link";
import ProblemsGrid from "@/components/ProblemsGrid";
import Avatar from "@/components/Avatar";
import { PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Swords, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard — CodeBattle" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("id, username, avatar_url, elo, xp, level, wins, losses, current_streak, best_streak, problems_solved, role")
    .eq("id", user.userId)
    .single();

  const problems = await listProblems();

  const { data: recentMatches } = await supabase
    .from("cb_matches")
    .select(
      "id, room_code, status, winner_id, created_at, problem_id, " +
        "cb_problems(title), " +
        "cb_match_problems(sort_order, cb_problems(title)), " +
        "cb_match_players!inner(xp_gained, elo_after, player_id), " +
        "cb_submissions(tests_passed, tests_total)"
    )
    .eq("cb_match_players.player_id", user.userId)
    .eq("cb_submissions.player_id", user.userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const matches = (recentMatches ?? []) as unknown as {
    id: string; room_code: string | null; status: string; winner_id: string | null;
    created_at: string; problem_id: string; cb_problems: { title: string } | null;
    cb_match_problems: { sort_order: number | null; cb_problems: { title: string } | null }[];
    cb_match_players: { xp_gained: number | null; elo_after: number | null; player_id: string }[];
    cb_submissions: { tests_passed: number | null; tests_total: number | null }[];
  }[];

  return (
    <PageShell className="min-h-screen">
      {/* Hero */}
      <section
        className="relative mb-8 overflow-hidden rounded-2xl border border-emerald-500/20 bg-neutral-900/60 p-8 sm:p-12"
        style={{ boxShadow: "0 0 40px rgba(34,197,94,0.08)" }}
      >
        <div className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full bg-emerald-500/10 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-emerald-400/5 blur-[100px]" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-x-4 gap-y-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-emerald-500/30 bg-neutral-900 sm:h-16 sm:w-16"
                style={{ boxShadow: "0 0 25px rgba(34,197,94,0.15)" }}
              >
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.username ?? user.username}
                  className="h-full w-full text-xl text-emerald-400 sm:text-2xl"
                />
              </span>
              <span>
                Welcome back,{" "}
                <span
                  className="text-emerald-400"
                  style={{ textShadow: "0 0 30px rgba(34,197,94,0.35)" }}
                >
                  {profile?.username ?? user.username}
                </span>
              </span>
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-neutral-400">
              Level {profile?.level ?? 1} ·{" "}
              <span className="font-semibold text-emerald-400">{profile?.elo ?? 1200} ELO</span> · Challenge developers
              to real-time coding duels — same problem, same clock, only the fastest mind wins.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              href="/play"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              <Swords className="h-5 w-5" />
              Battle Now
            </Link>
            <Link
              href="/leaderboard"
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full sm:w-auto")}
            >
              <Trophy className="h-5 w-5" />
              Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      {profile && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatCard label="ELO" value={profile.elo} color="emerald" />
          <StatCard label="Level" value={profile.level} color="amber" />
          <StatCard label="XP" value={profile.xp} color="emerald" />
          <StatCard label="Wins" value={profile.wins} color="amber" />
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
              const mp = m.cb_match_players?.[0];
              const won = m.winner_id === user.userId;
              const passed = (m.cb_submissions ?? []).reduce((a, s) => a + (s.tests_passed ?? 0), 0);
              const totalTests = (m.cb_submissions ?? []).reduce((a, s) => a + (s.tests_total ?? 0), 0);
              const titles = (m.cb_match_problems ?? [])
                .slice()
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((p) => p.cb_problems?.title)
                .filter(Boolean) as string[];
              const solo = m.room_code === null;
              return (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-4 transition-colors duration-200 hover:border-neutral-700">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <Badge tone={solo ? "accent" : "warn"}>{solo ? "SOLO" : "BATTLE"}</Badge>
                      <span className="truncate font-medium text-neutral-200" title={titles.length > 0 ? titles.join(" · ") : undefined}>
                        {titles.length > 1
                          ? `${titles[0]} +${titles.length - 1} more`
                          : titles[0] ?? m.cb_problems?.title ?? "Unknown"}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-neutral-500">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {totalTests > 0 && <span className="text-sm text-neutral-400">{passed}/{totalTests}</span>}
                    {mp?.xp_gained != null && <span className="text-sm font-bold text-emerald-400">+{mp.xp_gained} XP</span>}
                    {!solo && mp?.elo_after != null && (
                      <Badge tone={won ? "accent" : "danger"}>{won ? "WIN" : "LOSS"}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </PageShell>
  );
}
