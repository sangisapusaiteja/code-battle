import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = { title: "History — CodeBattle" };
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select(
      "id, room_code, status, winner_id, created_at, problem_id, " +
        "problems(title), " +
        "match_players!inner(xp_gained, elo_before, elo_after, player_id, is_host), " +
        "submissions(tests_passed, tests_total)"
    )
    .eq("match_players.player_id", user.userId)
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (matches ?? []) as unknown as {
    id: string; room_code: string | null; status: string; winner_id: string | null;
    created_at: string; problem_id: string; problems: { title: string } | null;
    match_players: { xp_gained: number | null; elo_before: number | null; elo_after: number | null; player_id: string; is_host: boolean; }[];
    submissions: { tests_passed: number | null; tests_total: number | null }[];
  }[];

  const isSolo = (m: (typeof rows)[number]) => m.room_code === null;

  return (
    <div className="min-h-screen">
      <Navbar>
        <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold rounded-lg border border-neutral-700 text-neutral-300 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5">
          Dashboard
        </Link>
      </Navbar>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-extrabold">
          <span className="text-emerald-400" style={{ textShadow: "0 0 20px rgba(34,197,94,0.3)" }}>Battle History</span>
        </h1>

        <div className="mt-2 mb-6 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        <div className="flex gap-3 mb-6">
          <span className="rounded-full bg-neutral-900 border border-neutral-800 px-4 py-1.5 text-xs font-medium text-neutral-300">{rows.length} total</span>
          <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold">{rows.filter(isSolo).length} solo</span>
          <span className="rounded-full bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 px-4 py-1.5 text-xs font-bold">{rows.filter((m) => !isSolo(m)).length} battles</span>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 text-center">
            <p className="text-sm text-neutral-500">No battles yet. Head to the arena and start competing.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((m) => {
              const mp = m.match_players?.[0];
              const won = m.winner_id === user.userId;
              const sub = m.submissions?.[0];
              const solo = isSolo(m);
              return (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-4 transition-all duration-200 hover:border-neutral-700">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className={`rounded-md px-2.5 py-1 text-xs font-bold border ${solo ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"}`}>
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
                      <span className={`rounded-md px-2.5 py-1 text-xs font-bold border ${won ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20"}`}>
                        {won ? "WIN" : "LOSS"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
