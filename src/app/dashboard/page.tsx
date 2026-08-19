import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import { listProblems } from "@/lib/problems/data";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProblemsGrid from "@/components/ProblemsGrid";

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

  const isAdmin = profile?.role === "admin";

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
    id: string; room_code: string | null; status: string; winner_id: string | null;
    created_at: string; problem_id: string; problems: { title: string } | null;
    match_players: { xp_gained: number | null; elo_after: number | null; player_id: string }[];
    submissions: { tests_passed: number | null; tests_total: number | null }[];
  }[];

  return (
    <div className="min-h-screen">
      <Navbar>
        {[
          { href: "/leaderboard", label: "Leaderboard" },
          { href: "/profile", label: "Profile" },
          { href: "/history", label: "History" },
          ...(isAdmin ? [{ href: "/admin/problems", label: "Admin" }] : []),
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-neutral-700 text-neutral-300 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5"
          >
            {link.label}
          </Link>
        ))}
        <form action={logout}>
          <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-lg border border-neutral-700 text-neutral-300 transition-all duration-200 hover:border-[#ef4444]/30 hover:text-[#ef4444] hover:bg-[#ef4444]/5">
            Logout
          </button>
        </form>
      </Navbar>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* User Info */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-500/20 bg-neutral-900 text-xl font-bold text-emerald-400" style={{ boxShadow: "0 0 20px rgba(34,197,94,0.1)" }}>
            {(profile?.username ?? "?")[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{profile?.username ?? user.username}</h1>
            <p className="text-sm text-neutral-500">
              Level {profile?.level ?? 1} · <span className="text-emerald-400">{profile?.elo ?? 1200} ELO</span>
            </p>
          </div>
        </div>

        {/* Stats Row */}
        {profile && (
          <section className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <Stat label="ELO" value={profile.elo} color="#22c55e" />
            <Stat label="Level" value={profile.level} color="#f59e0b" />
            <Stat label="XP" value={profile.xp} color="#22c55e" />
            <Stat label="Wins" value={profile.wins} color="#f59e0b" />
          </section>
        )}

        {/* CTA Banner */}
        <section className="mt-8 rounded-xl border border-emerald-500/10 bg-neutral-900/60 p-6 backdrop-blur-sm" style={{ boxShadow: "0 0 30px rgba(34,197,94,0.05)" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-100">Ready to fight?</h2>
              <p className="mt-1 text-sm text-neutral-400">Create a room, share the code, and your opponent joins.</p>
            </div>
            <Link
              href="/play"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-105 text-center"
            >
              Enter Arena
            </Link>
          </div>
        </section>

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
                const sub = m.submissions?.[0];
                const solo = m.room_code === null;
                return (
                  <div key={m.id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-4 transition-all duration-200 hover:border-neutral-700">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${solo ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20"}`}>
                          {solo ? "SOLO" : "BATTLE"}
                        </span>
                        <span className="truncate font-medium text-neutral-200">{m.problems?.title ?? "Unknown"}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-neutral-500">{new Date(m.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {sub && <span className="text-sm text-neutral-400">{sub.tests_passed ?? 0}/{sub.tests_total ?? 0}</span>}
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
