import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Profile — Code Battle" };
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

  const winRate =
    profile && profile.wins + profile.losses > 0
      ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
      : 0;

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-200">
          ← Dashboard
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-black">
          {(profile?.username ?? "?")[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile?.username ?? user.username}</h1>
          <p className="text-sm text-neutral-400">
            Level {profile?.level ?? 1} · {profile?.elo ?? 1200} ELO
          </p>
        </div>
      </div>

      {profile && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="ELO" value={profile.elo} accent />
          <Stat label="XP" value={profile.xp} />
          <Stat label="Wins" value={profile.wins} />
          <Stat label="Losses" value={profile.losses} />
          <Stat label="Win rate" value={`${winRate}%`} />
          <Stat label="Streak" value={`${profile.current_streak}d`} />
          <Stat label="Best streak" value={`${profile.best_streak}d`} />
          <Stat label="Solved" value={profile.problems_solved} />
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Rating history</h2>
        {!ratings || ratings.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No battles yet. Head to the arena and start competing.
          </p>
        ) : (
          <div className="space-y-2">
            {ratings.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm"
              >
                <span className="text-neutral-400">
                  {r.elo_before} → {r.elo_after}
                </span>
                <span className={r.delta >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {r.delta >= 0 ? "+" : ""}
                  {r.delta} ELO
                </span>
                <span className="text-neutral-600">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
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
