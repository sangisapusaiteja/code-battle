import { createClient } from "@/lib/supabase/client";

export interface MatchRow {
  id: string;
  problem_id: string;
  status: string;
  room_code: string;
  starts_at: string | null;
  duration_seconds: number;
  current_problem_index: number;
  winner_id: string | null;
  created_at: string;
  finished_at: string | null;
}

export interface MatchPlayerRow {
  id: string;
  match_id: string;
  player_id: string;
  is_host: boolean;
  ready: boolean;
  elo_before: number | null;
  elo_after: number | null;
  xp_gained: number | null;
  finished_at: string | null;
  current_problem_index: number;
  problem_started_at: string | null;
}

export interface ProfileRow {
  id: string;
  username: string;
  elo: number;
  xp: number;
  level: number;
  wins: number;
  losses: number;
}

export interface SubmissionRow {
  id: string;
  match_id: string;
  player_id: string;
  tests_passed: number | null;
  tests_total: number | null;
  is_final: boolean;
  created_at: string;
}

export async function getMatchByCode(code: string): Promise<MatchRow | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("matches")
    .select("*")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();
  return (data as MatchRow) ?? null;
}

export async function getMatchPlayers(matchId: string): Promise<MatchPlayerRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("match_players")
    .select("*")
    .eq("match_id", matchId);
  return (data ?? []) as MatchPlayerRow[];
}

export async function getProfiles(ids: string[]): Promise<ProfileRow[]> {
  if (ids.length === 0) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("id, username, elo, xp, level, wins, losses")
    .in("id", ids);
  return (data ?? []) as ProfileRow[];
}

export async function getSubmissions(matchId: string): Promise<SubmissionRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("submissions")
    .select("*")
    .eq("match_id", matchId)
    .eq("is_final", true);
  return (data ?? []) as SubmissionRow[];
}

export async function getMatchProblems(matchId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("match_problems")
    .select("problem_id")
    .eq("match_id", matchId)
    .order("sort_order", { ascending: true });
  return (data ?? []).map((r) => (r as { problem_id: string }).problem_id);
}

export function subscribeToMatch(
  matchId: string,
  onMatch: (m: MatchRow) => void,
  onPlayers: (p: MatchPlayerRow[]) => void,
  onSubmissions: (s: SubmissionRow[]) => void
) {
  const supabase = createClient();

  const matchChannel = supabase
    .channel(`match-${matchId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
      (payload) => {
        if (payload.new) onMatch(payload.new as MatchRow);
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "match_players", filter: `match_id=eq.${matchId}` },
      () => {
        getMatchPlayers(matchId).then(onPlayers);
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "submissions", filter: `match_id=eq.${matchId}` },
      () => {
        getSubmissions(matchId).then(onSubmissions);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(matchChannel);
  };
}
