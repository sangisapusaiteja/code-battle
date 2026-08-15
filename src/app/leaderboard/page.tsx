import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Leaderboard — Code Battle" };
export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("users")
    .select("id, username, elo, wins, losses, xp, level")
    .order("elo", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-200">
          ← Dashboard
        </Link>
      </div>

      <div className="mt-6 space-y-2">
        {(players ?? []).map((p, i) => {
          const winRate = p.wins + p.losses > 0 ? Math.round((p.wins / (p.wins + p.losses)) * 100) : 0;
          const isMe = p.id === user.userId;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
                isMe ? "border-emerald-600/60 bg-emerald-600/5" : "border-neutral-800 bg-neutral-900/40"
              }`}
            >
              <span className="w-8 text-center font-bold text-neutral-500">#{i + 1}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-black">
                {p.username[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-neutral-200">
                  {p.username}
                  {isMe && <span className="ml-2 text-xs text-emerald-400">(you)</span>}
                </p>
                <p className="text-sm text-neutral-500">
                  {p.wins}W · {p.losses}L · {winRate}% win rate
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-400">{p.elo}</p>
                <p className="text-xs text-neutral-500">ELO</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
