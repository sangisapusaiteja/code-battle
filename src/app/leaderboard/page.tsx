import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = { title: "Leaderboard — CodeBattle" };
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
    <div className="min-h-screen">
      <Navbar>
        <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold rounded-lg border border-neutral-700 text-neutral-300 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5">
          Dashboard
        </Link>
      </Navbar>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-extrabold">
          <span className="text-emerald-400" style={{ textShadow: "0 0 20px rgba(34,197,94,0.3)" }}>Leaderboard</span>
        </h1>

        <div className="mt-2 mb-8 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        <div className="space-y-3">
          {(players ?? []).map((p, i) => {
            const winRate = p.wins + p.losses > 0 ? Math.round((p.wins / (p.wins + p.losses)) * 100) : 0;
            const isMe = p.id === user.userId;
            const isTop3 = i < 3;
            return (
              <div key={p.id}
                className={`flex items-center gap-4 rounded-xl px-5 py-4 transition-all duration-200 ${
                  isMe ? "border border-emerald-500/30 bg-emerald-500/5" : "border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
                }`}>
                <span className={`w-8 text-center font-black ${isTop3 ? "text-emerald-400 text-lg" : "text-neutral-600"}`}>#{i + 1}</span>
                <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${
                  isTop3 ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-900 text-neutral-400"
                }`} style={isTop3 ? { boxShadow: "0 0 15px rgba(34,197,94,0.15)" } : undefined}>
                  {p.username[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-200">
                    {p.username}
                    {isMe && <span className="ml-2 text-xs text-emerald-400">(you)</span>}
                  </p>
                  <p className="text-sm text-neutral-500">{p.wins}W · {p.losses}L · {winRate}% win rate</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-emerald-400" style={{ textShadow: "0 0 15px rgba(34,197,94,0.3)" }}>{p.elo}</p>
                  <p className="text-xs text-neutral-500 font-medium">ELO</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
