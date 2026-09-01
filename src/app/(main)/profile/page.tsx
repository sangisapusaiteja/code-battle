import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";
import ProfileAccountCard from "@/components/ProfileAccountCard";

export const metadata = { title: "Profile — CodeBattle" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("id, username, avatar_url, elo, xp, level, wins, losses, current_streak, best_streak, problems_solved")
    .eq("id", user.userId)
    .single();

  const { data: ratings } = await supabase
    .from("cb_ratings")
    .select(
      "elo_before, elo_after, delta, created_at, match_id, " +
        "cb_matches(room_code, problem_id, cb_problems(title), cb_match_problems(sort_order, cb_problems(title)), cb_match_players(player_id, users(username)))"
    )
    .eq("player_id", user.userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const winRate = profile && profile.wins + profile.losses > 0 ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100) : 0;

  const ratingRows = (ratings ?? []) as unknown as {
    elo_before: number; elo_after: number; delta: number; created_at: string;
    cb_matches: {
      room_code: string | null;
      problem_id: string | null;
      cb_problems: { title: string } | null;
      cb_match_problems: { sort_order: number | null; cb_problems: { title: string } | null }[];
      cb_match_players: { player_id: string; users: { username: string } | null }[];
    } | null;
  }[];

  const opponentOf = (r: (typeof ratingRows)[number]): string | null => {
    const players = r.cb_matches?.cb_match_players ?? [];
    const opp = players.find((p) => p.player_id !== user.userId);
    return opp?.users?.username ?? null;
  };

  const problemsOf = (r: (typeof ratingRows)[number]): string[] => {
    const list = (r.cb_matches?.cb_match_problems ?? [])
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((p) => p.cb_problems?.title)
      .filter(Boolean) as string[];
    if (list.length > 0) return list;
    const single = r.cb_matches?.cb_problems?.title;
    return single ? [single] : [];
  };

  return (
    <div className="w-full min-h-screen px-6 sm:px-10 lg:px-14">
      <div className="w-full px-6 sm:px-10 lg:px-14 py-8">
        {/* Player Card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-neutral-900/80 p-8" style={{ boxShadow: "0 0 40px rgba(34,197,94,0.05)" }}>
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10" style={{ boxShadow: "0 0 15px rgba(34,197,94,0.4)" }}>
              <Avatar src={profile?.avatar_url} name={profile?.username ?? user.username} className="h-full w-full text-3xl text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-neutral-100">{profile?.username ?? user.username}</h1>
              <p className="mt-1 text-neutral-400">
                Level {profile?.level ?? 1} · <span className="text-emerald-400 font-semibold">{profile?.elo ?? 1200} ELO</span>
              </p>
            </div>
          </div>
        </div>

        <ProfileAccountCard />

        {/* Stats Grid */}
        {profile && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <Stat label="ELO" value={profile.elo} color="#22c55e" sub="Elo Rating · skill level" />
            <Stat label="XP" value={profile.xp} color="#f59e0b" sub="Experience Points" />
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
              {ratingRows.map((r, i) => {
                const opp = opponentOf(r);
                const solo = r.cb_matches?.room_code === null;
                const problems = problemsOf(r);
                const problemLabel = problems.length > 1
                  ? `${problems[0]} +${problems.length - 1} more`
                  : problems[0] ?? "Unknown";
                return (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-4 transition-all duration-200 hover:border-neutral-700">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${solo ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"}`}>
                          {solo ? "SOLO" : "BATTLE"}
                        </span>
                        <span className="truncate font-medium text-neutral-200" title={problems.join(" · ")}>
                          {solo ? "Solo" : opp ? `vs ${opp}` : "Battle"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">{problemLabel}</p>
                      <p className="mt-0.5 text-xs text-neutral-600">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm text-neutral-400">{r.elo_before} → {r.elo_after}</span>
                      <span className={`text-base font-bold ${r.delta >= 0 ? "text-emerald-400" : "text-[#ef4444]"}`}>
                        {r.delta >= 0 ? "+" : ""}{r.delta} ELO
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, color, sub }: { label: string; value: number | string; color: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 transition-all duration-200 hover:border-neutral-700">
      <p className="text-3xl font-extrabold" style={{ color, textShadow: `0 0 15px ${color}30` }}>{value}</p>
      <p className="mt-1.5 text-xs uppercase tracking-wide text-neutral-500 font-medium">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] normal-case tracking-normal text-neutral-600">{sub}</p>}
    </div>
  );
}
