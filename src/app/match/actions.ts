"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

const ROOM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function roomCode(): string {
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)];
  }
  return out;
}

export type MatchActionResult = { error: string } | { code: string };

/** Returns the current user's id + username from the session cookie. */
export async function getCurrentUser(): Promise<{ id: string; username: string } | null> {
  const user = await requireUser();
  return { id: user.userId, username: user.username };
}

/**
 * Solo practice submission. Creates a single-player match, records the
 * submission, and awards XP when the solution is correct.
 */
export async function submitSolo(
  problemId: string,
  source: string,
  testsPassed: number,
  testsTotal: number,
  language: string = "javascript"
): Promise<{ error?: string; xpGained?: number }> {
  const user = await requireUser();
  const supabase = await createClient();

  // Create a single-player match (no room code — it's solo practice).
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      problem_id: problemId,
      status: "finished",
      winner_id: user.userId,
      finished_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (matchError || !match) return { error: matchError?.message ?? "Failed to record practice." };

  // Award XP only for a correct solution.
  const correct = testsPassed === testsTotal && testsTotal > 0;
  const xpGained = correct ? 20 : 0;

  const { error: playerError } = await supabase.from("match_players").insert({
    match_id: match.id,
    player_id: user.userId,
    is_host: true,
    ready: true,
    xp_gained: xpGained,
  });
  if (playerError) return { error: playerError.message };

  const { error: subError } = await supabase.from("submissions").insert({
    match_id: match.id,
    player_id: user.userId,
    problem_id: problemId,
    source_code: source,
    language,
    tests_passed: testsPassed,
    tests_total: testsTotal,
    is_final: true,
  });
  if (subError) return { error: subError.message };

  if (correct) {
    await supabase.rpc("award_solo_xp", {
      p_user_id: user.userId,
      p_xp: xpGained,
      p_problems_solved: 1,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { xpGained };
}

/**
 * Solo practice set. Records a submission for each problem in the set and
 * awards XP for each correct solution. Returns per-problem results.
 */
export async function submitSoloSet(
  problemId: string,
  source: string,
  testsPassed: number,
  testsTotal: number,
  language: string = "javascript"
): Promise<{ error?: string; xpGained?: number; correct?: boolean }> {
  const user = await requireUser();
  const supabase = await createClient();

  const correct = testsPassed === testsTotal && testsTotal > 0;
  const xpGained = correct ? 20 : 0;

  // Create a single-player match for this problem.
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      problem_id: problemId,
      status: "finished",
      winner_id: user.userId,
      finished_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (matchError || !match) return { error: matchError?.message ?? "Failed to record practice." };

  const { error: playerError } = await supabase.from("match_players").insert({
    match_id: match.id,
    player_id: user.userId,
    is_host: true,
    ready: true,
    xp_gained: xpGained,
  });
  if (playerError) return { error: playerError.message };

  const { error: subError } = await supabase.from("submissions").insert({
    match_id: match.id,
    player_id: user.userId,
    problem_id: problemId,
    source_code: source,
    language,
    tests_passed: testsPassed,
    tests_total: testsTotal,
    is_final: true,
  });
  if (subError) return { error: subError.message };

  if (correct) {
    await supabase.rpc("award_solo_xp", {
      p_user_id: user.userId,
      p_xp: xpGained,
      p_problems_solved: 1,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { xpGained, correct };
}

/** Host creates a room for a given problem. */
export async function createMatch(problemIds: string[]): Promise<MatchActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  if (!problemIds || problemIds.length === 0) {
    return { error: "Select at least one problem." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.userId)
    .single();
  if (!profile) return { error: "User not found." };

  let code = roomCode();
  // Ensure uniqueness.
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase
      .from("matches")
      .select("id")
      .eq("room_code", code)
      .maybeSingle();
    if (!existing) break;
    code = roomCode();
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({ problem_id: problemIds[0], room_code: code, status: "waiting" })
    .select("id")
    .single();
  if (matchError || !match) return { error: matchError?.message ?? "Failed to create room." };

  // Record all problems for this match.
  const { error: mpError } = await supabase.from("match_problems").insert(
    problemIds.map((pid, i) => ({ match_id: match.id, problem_id: pid, sort_order: i }))
  );
  if (mpError) return { error: mpError.message };

  const { error: playerError } = await supabase.from("match_players").insert({
    match_id: match.id,
    player_id: user.userId,
    is_host: true,
    ready: false,
  });
  if (playerError) return { error: playerError.message };

  return { code };
}

/** Guest joins a room by code. */
export async function joinMatch(code: string): Promise<MatchActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("matches")
    .select("id, status")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();
  if (!match) return { error: "No open room with that code was found." };
  if (match.status !== "waiting") return { error: "That room is already in progress." };

  const { data: existing } = await supabase
    .from("match_players")
    .select("id")
    .eq("match_id", match.id)
    .eq("player_id", user.userId)
    .maybeSingle();
  if (existing) return { error: "You are already in this room." };

  const { error: playerError } = await supabase.from("match_players").insert({
    match_id: match.id,
    player_id: user.userId,
    is_host: false,
    ready: false,
  });
  if (playerError) return { error: playerError.message };

  // Advance waiting -> matched.
  await supabase.rpc("transition_match", {
    p_match_id: match.id,
    p_from_status: "waiting",
    p_to_status: "matched",
  });

  return { code: code.toUpperCase() };
}

/** Host starts the countdown. */
export async function startMatch(matchId: string): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: mp } = await supabase
    .from("match_players")
    .select("is_host")
    .eq("match_id", matchId)
    .eq("player_id", user.userId)
    .single();
  if (!mp?.is_host) return { error: "Only the host can start the match." };

  await supabase.rpc("transition_match", {
    p_match_id: matchId,
    p_from_status: "matched",
    p_to_status: "countdown",
  });
  return {};
}

/** Host begins the active phase after the countdown. */
export async function beginActive(matchId: string): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: mp } = await supabase
    .from("match_players")
    .select("is_host")
    .eq("match_id", matchId)
    .eq("player_id", user.userId)
    .single();
  if (!mp?.is_host) return { error: "Only the host can begin the match." };

  await supabase.rpc("transition_match", {
    p_match_id: matchId,
    p_from_status: "countdown",
    p_to_status: "active",
  });

  // Start each player's per-problem timer.
  await supabase.rpc("start_player_timers", { p_match_id: matchId });
  return {};
}

/** Record a final submission and advance the battle. */
export async function submitSolution(
  matchId: string,
  problemId: string,
  problemIndex: number,
  source: string,
  testsPassed: number,
  testsTotal: number,
  language: string = "javascript"
): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("matches")
    .select("id, status")
    .eq("id", matchId)
    .single();
  if (!match) return { error: "Match not found." };
  if (match.status !== "active" && match.status !== "evaluating") {
    return { error: "This match is not accepting submissions." };
  }

  const { error: subError } = await supabase.from("submissions").insert({
    match_id: matchId,
    player_id: user.userId,
    problem_id: problemId,
    source_code: source,
    language,
    tests_passed: testsPassed,
    tests_total: testsTotal,
    is_final: true,
  });
  if (subError) return { error: subError.message };

  // Get the ordered problem list.
  const { data: matchProblems } = await supabase
    .from("match_problems")
    .select("problem_id")
    .eq("match_id", matchId)
    .order("sort_order", { ascending: true });

  const nextIndex = problemIndex + 1;
  if (matchProblems && nextIndex < matchProblems.length) {
    // Advance THIS player to the next problem. Timer keeps running (started once).
    const { error: advError } = await supabase.rpc("advance_player", {
      p_match_id: matchId,
      p_player_id: user.userId,
      p_next_index: nextIndex,
      p_finished: false,
    });
    if (advError) return { error: advError.message };
    return {};
  }

  // This player has completed all problems. Mark them finished.
  const { error: finError } = await supabase.rpc("advance_player", {
    p_match_id: matchId,
    p_player_id: user.userId,
    p_next_index: null,
    p_finished: true,
  });
  if (finError) return { error: finError.message };

  // Check if the opponent has also finished.
  const { data: mpRows } = await supabase
    .from("match_players")
    .select("player_id, finished_at")
    .eq("match_id", matchId);

  const finishedIds = (mpRows ?? []).filter((r) => r.finished_at).map((r) => r.player_id);
  if (finishedIds.length >= 2) {
    // Both finished — faster finisher wins.
    await finalizeMatch(matchId);
  }
  return {};
}

/** A player accepts defeat, ending the match with the opponent as winner. */
export async function acceptDefeat(matchId: string): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("matches")
    .select("id, status")
    .eq("id", matchId)
    .single();
  if (!match) return { error: "Match not found." };
  if (match.status === "finished") return {};

  // The opponent (the other player) is the winner.
  const { data: players } = await supabase
    .from("match_players")
    .select("player_id")
    .eq("match_id", matchId);
  const winnerId = (players ?? []).find((p) => p.player_id !== user.userId)?.player_id;
  if (!winnerId) return { error: "No opponent found." };

  await supabase.rpc("finalize_match", {
    p_match_id: matchId,
    p_winner_id: winnerId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/leaderboard");
  return {};
}

/** Server computes the winner and finalizes. */
async function finalizeMatch(matchId: string) {
  const supabase = await createClient();

  // If both players finished, the faster finisher wins.
  const { data: mpRows } = await supabase
    .from("match_players")
    .select("player_id, finished_at")
    .eq("match_id", matchId);

  const finished = (mpRows ?? []).filter((r) => r.finished_at);
  if (finished.length >= 2) {
    const [a, b] = finished;
    const aTime = new Date(a.finished_at).getTime();
    const bTime = new Date(b.finished_at).getTime();
    const winnerId = aTime < bTime ? a.player_id : b.player_id;
    await supabase.rpc("finalize_match", { p_match_id: matchId, p_winner_id: winnerId });
    revalidatePath("/dashboard");
    revalidatePath("/profile");
    revalidatePath("/leaderboard");
    return;
  }

  // Otherwise, fall back to combined score across all problems.
  const { data: subs } = await supabase
    .from("submissions")
    .select("player_id, tests_passed, created_at")
    .eq("match_id", matchId)
    .eq("is_final", true);

  if (!subs || subs.length < 2) return;

  const totals = new Map<string, { passed: number; lastTime: number }>();
  for (const s of subs) {
    const cur = totals.get(s.player_id) ?? { passed: 0, lastTime: 0 };
    cur.passed += s.tests_passed ?? 0;
    cur.lastTime = Math.max(cur.lastTime, new Date(s.created_at).getTime());
    totals.set(s.player_id, cur);
  }

  const [a, b] = [...totals.entries()];
  let winnerId: string | null = null;
  if (a[1].passed !== b[1].passed) {
    winnerId = a[1].passed > b[1].passed ? a[0] : b[0];
  } else if (a[1].lastTime !== b[1].lastTime) {
    winnerId = a[1].lastTime < b[1].lastTime ? a[0] : b[0];
  }

  if (winnerId) {
    await supabase.rpc("finalize_match", {
      p_match_id: matchId,
      p_winner_id: winnerId,
    });
  } else {
    // Perfect draw: just mark finished with no winner.
    await supabase.rpc("finish_match_draw", { p_match_id: matchId });
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/leaderboard");
}

/**
 * Public server action: finalize a match when both players have finished.
 * Idempotent — safe to call from either client. Used as a fallback when the
 * realtime echo of the last player's finish doesn't reach the other client.
 */
export async function finalizeMatchAction(matchId: string): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("matches")
    .select("id, status")
    .eq("id", matchId)
    .single();
  if (!match) return { error: "Match not found." };
  if (match.status === "finished") return {};

  // Only participants may finalize.
  const { data: mp } = await supabase
    .from("match_players")
    .select("player_id")
    .eq("match_id", matchId)
    .eq("player_id", user.userId)
    .maybeSingle();
  if (!mp) return { error: "You are not a participant." };

  await finalizeMatch(matchId);
  return {};
}
