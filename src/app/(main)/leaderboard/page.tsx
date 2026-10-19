import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";
import { PageShell, PageHeader } from "@/components/ui/page-shell";

export const metadata = { title: "Leaderboard — CodeBattle" };
export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("users")
    .select("id, username, avatar_url, elo, wins, losses, xp, level")
    .order("elo", { ascending: false })
    .limit(50);

  return (
    <PageShell className="min-h-screen">
      <PageHeader title="Leaderboard" />

      <div className="space-y-3">
        {(players ?? []).map((p, i) => {
          const winRate = p.wins + p.losses > 0 ? Math.round((p.wins / (p.wins + p.losses)) * 100) : 0;
          const isMe = p.id === user.userId;
          const isTop3 = i < 3;
          return (
            <div key={p.id}
              className={`flex items-center gap-4 rounded-xl px-5 py-4 transition-colors duration-200 ${
                isMe ? "border border-emerald-500/30 bg-emerald-500/5" : "border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
              }`}>
              <span className={`w-8 text-center font-black ${isTop3 ? "text-lg text-emerald-400" : "text-neutral-600"}`}>#{i + 1}</span>
              <div className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${
                isTop3 ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-900 text-neutral-400"
              }`} style={isTop3 ? { boxShadow: "0 0 15px rgba(34,197,94,0.15)" } : undefined}>
                <Avatar src={p.avatar_url} name={p.username} className="h-full w-full" />
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
                <p className="text-xs font-medium text-neutral-500">ELO</p>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
