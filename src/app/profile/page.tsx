import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = { title: "Profile — CodeBattle" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("id, username, elo, xp, level, wins, losses, current_streak, best_streak, problems_solved")
    .eq("id", user.userId)
    .single();

  const { data: ratings } = await supabase
    .from("ratings")
    .select("elo_before, elo_after, delta, created_at")
    .eq("player_id", user.userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const winRate = profile && profile.wins + profile.losses > 0 ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100) : 0;

  return (
    <div className="min-h-screen">
      <Navbar>
        <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold rounded-lg border border-neutral-700 text-neutral-300 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5">
          Dashboard
        </Link>
      </Navbar>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        {/* Player Card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-neutral-900/80 p-8" style={{ boxShadow: "0 0 40px rgba(34,197,94,0.05)" }}>
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-3xl font-black text-emerald-400" style={{ textShadow: "0 0 15px rgba(34,197,94,0.4)" }}>
              {(profile?.username ?? "?")[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-neutral-100">{profile?.username ?? user.username}</h1>
              <p className="mt-1 text-neutral-400">
                Level {profile?.level ?? 1} · <span className="text-emerald-400 font-semibold">{profile?.elo ?? 1200} ELO</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {profile && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <Stat label="ELO" value={profile.elo} color="#22c55e" />
            <Stat label="XP" value={profile.xp} color="#f59e0b" />
            <Stat label="Wins" value={profile.wins} color="#22c55e" />
            <Stat label="Losses" value={profile.losses} color="#ef4444" />
            <Stat label="Win Rate" value={`${winRate}%`} color="#22c55e" />
            <Stat label="Streak" value={`${profile.current_streak}d`} color="#f59e0b" />
            <Stat label="Best Streak" value={`${profile.best_streak}d`} color="#f59e0b" />
            <Stat label="Solved" value={profile.problems_solved} color="#22c55e" />
          </div>
        )}

        {/* Rating History */}
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-neutral-500">Rating History</h2>
          {!ratings || ratings.length === 0 ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 text-center">
              <p className="text-sm text-neutral-500">No battles yet. Head to the arena and start competing.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ratings.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-4 transition-all duration-200 hover:border-neutral-700">
                  <span className="font-mono text-sm text-neutral-400">{r.elo_before} → {r.elo_after}</span>
                  <span className={`text-base font-bold ${r.delta >= 0 ? "text-emerald-400" : "text-[#ef4444]"}`}>
                    {r.delta >= 0 ? "+" : ""}{r.delta} ELO
                  </span>
                  <span className="text-xs text-neutral-600">{new Date(r.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 transition-all duration-200 hover:border-neutral-700">
      <p className="text-3xl font-extrabold" style={{ color, textShadow: `0 0 15px ${color}30` }}>{value}</p>
      <p className="mt-1.5 text-xs uppercase tracking-wide text-neutral-500 font-medium">{label}</p>
    </div>
  );
}
