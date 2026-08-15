import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "History — Code Battle" };
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
    id: string;
    room_code: string | null;
    status: string;
    winner_id: string | null;
    created_at: string;
    problem_id: string;
    problems: { title: string } | null;
    match_players: {
      xp_gained: number | null;
      elo_before: number | null;
      elo_after: number | null;
      player_id: string;
      is_host: boolean;
    }[];
    submissions: { tests_passed: number | null; tests_total: number | null }[];
  }[];

  const isSolo = (m: (typeof rows)[number]) => m.room_code === null;

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Battle history</h1>
        <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-200">
          ← Dashboard
        </Link>
      </div>

      <div className="mt-6 flex gap-2">
        <span className="rounded bg-neutral-800 px-3 py-1 text-xs text-neutral-300">
          {rows.length} total
        </span>
        <span className="rounded bg-emerald-500/15 px-3 py-1 text-xs text-emerald-400">
          {rows.filter(isSolo).length} solo
        </span>
        <span className="rounded bg-amber-500/15 px-3 py-1 text-xs text-amber-400">
          {rows.filter((m) => !isSolo(m)).length} battles
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">
          No battles yet. Head to the arena and start competing.
        </p>
      ) : (
        <div className="mt-6 space-y-2">
          {rows.map((m) => {
            const mp = m.match_players?.[0];
            const won = m.winner_id === user.userId;
            const sub = m.submissions?.[0];
            const solo = isSolo(m);
            return (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        solo
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {solo ? "SOLO" : "BATTLE"}
                    </span>
                    <span className="truncate font-medium text-neutral-200">
                      {m.problems?.title ?? "Unknown problem"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {sub && (
                    <span className="text-neutral-400">
                      {sub.tests_passed ?? 0}/{sub.tests_total ?? 0}
                    </span>
                  )}
                  {mp?.xp_gained != null && (
                    <span className="text-emerald-400">+{mp.xp_gained} XP</span>
                  )}
                  {!solo && mp?.elo_after != null && (
                    <span className={won ? "text-emerald-400" : "text-red-400"}>
                      {won ? "W" : "L"}
                    </span>
                  )}
                  {solo && (
                    <span className="text-emerald-400">
                      {mp?.xp_gained && mp.xp_gained > 0 ? "Solved" : "Attempted"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
