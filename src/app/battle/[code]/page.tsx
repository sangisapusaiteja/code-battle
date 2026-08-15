"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import {
  getMatchByCode,
  getMatchPlayers,
  getMatchProblems,
  getProfiles,
  getSubmissions,
  subscribeToMatch,
  type MatchRow,
  type MatchPlayerRow,
  type ProfileRow,
  type SubmissionRow,
} from "@/lib/battle/client-data";
import {
  getProblemClient,
  getTestCasesClient,
  type Problem,
  type TestCase,
} from "@/lib/problems/client-data";
import { runSolution } from "@/lib/code/runner";
import { LANGUAGES, getLanguage, starterFor, type LanguageId } from "@/lib/code/languages";
import { startMatch, beginActive, submitSolution, acceptDefeat, finalizeMatchAction, getCurrentUser } from "@/app/match/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TestRunResult } from "@/types";

export default function BattlePage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();

  const [match, setMatch] = useState<MatchRow | null>(null);
  const [players, setPlayers] = useState<MatchPlayerRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [problemIds, setProblemIds] = useState<string[]>([]);
  const [problemIndex, setProblemIndex] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [code_, setCode_] = useState("");
  const [language, setLanguage] = useState<LanguageId>("javascript");
  const [runResult, setRunResult] = useState<TestRunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedCurrent, setSubmittedCurrent] = useState(false);
  const [now, setNow] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [countdownEnd, setCountdownEnd] = useState<number | null>(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [quitting, setQuitting] = useState(false);

  const codeRef = useRef<string | null>(null);
  const matchRef = useRef<MatchRow | null>(null);
  const playersRef = useRef<MatchPlayerRow[]>([]);
  const submissionsRef = useRef<SubmissionRow[]>([]);
  const problemIndexRef = useRef(0);
  const problemIdsRef = useRef<string[]>([]);
  const startedRef = useRef(false);
  const myFinishedRef = useRef<string | null>(null);
  const meIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | null = null;

    async function init() {
      const me = await getCurrentUser();
      if (!me) {
        router.replace("/login");
        return;
      }
      setMeId(me.id);
      meIdRef.current = me.id;

      const m = await getMatchByCode(code);
      if (!m) {
        setError("No open room with that code was found.");
        return;
      }
      matchRef.current = m;
      setMatch(m);

      const [ps, subs, pids] = await Promise.all([
        getMatchPlayers(m.id),
        getSubmissions(m.id),
        getMatchProblems(m.id),
      ]);
      playersRef.current = ps;
      submissionsRef.current = subs;
      setPlayers(ps);
      setSubmissions(subs);
      setProblemIds(pids);
      problemIdsRef.current = pids;

      const ids = ps.map((p) => p.player_id);
      const profs = await getProfiles(ids);
      setProfiles(Object.fromEntries(profs.map((p) => [p.id, p])));

      // Use THIS player's progress (per-player index + timer).
      const myPlayer = ps.find((p) => p.player_id === me.id);
      const startIndex = myPlayer?.current_problem_index ?? 0;
      setProblemIndex(startIndex);
      problemIndexRef.current = startIndex;
      const pid = pids[startIndex] ?? m.problem_id;
      const prob = await getProblemClient(pid);
      if (prob) {
        setProblem(prob);
        if (!codeRef.current) {
          codeRef.current = prob.starter_code;
          setCode_(prob.starter_code);
        }
        const tc = await getTestCasesClient(prob.id);
        setTestCases(tc);
      }
      if (cancelled) return;
      unsub = subscribeToMatch(
        m.id,
        (nm) => {
          matchRef.current = nm;
          setMatch(nm);
          if (nm.status === "countdown") {
            setCountdownEnd(Date.now() + 5000);
          }
        },
        (np) => {
          playersRef.current = np;
          setPlayers(np);
          getProfiles(np.map((p) => p.player_id)).then((profs) =>
            setProfiles(Object.fromEntries(profs.map((p) => [p.id, p])))
          );
          // Advance THIS player to the next problem when their index changes.
          const myRow = np.find((p) => p.player_id === me.id);
          const nextIdx = myRow?.current_problem_index ?? 0;
          if (nextIdx !== problemIndexRef.current) {
            problemIndexRef.current = nextIdx;
            setProblemIndex(nextIdx);
            const pid = problemIdsRef.current[nextIdx];
            if (pid) {
              getProblemClient(pid).then((p) => {
                if (p) {
                  setProblem(p);
                  codeRef.current = p.starter_code;
                  setCode_(p.starter_code);
                }
              });
              getTestCasesClient(pid).then(setTestCases);
            }
          }
        },
        (ns) => {
          submissionsRef.current = ns;
          setSubmissions(ns);
        }
      );
    }

    init();
    const timer = setInterval(() => setNow(Date.now()), 250);

    // Polling fallback: periodically refetch the match + players so both
    // clients converge on the finished state even if realtime misses an echo
    // (Supabase does not echo a client's own changes).
    const poll = setInterval(async () => {
      if (cancelled) return;
      const m = await getMatchByCode(code);
      if (!m) return;
      matchRef.current = m;
      setMatch(m);
      const ps = await getMatchPlayers(m.id);
      // Preserve our own optimistic finished_at across polls (in case the
      // server write is delayed or the RPC is not yet deployed).
      const merged = ps.map((p) =>
        p.player_id === meIdRef.current && !p.finished_at && myFinishedRef.current
          ? { ...p, finished_at: myFinishedRef.current }
          : p
      );
      playersRef.current = merged;
      setPlayers(merged);
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(timer);
      clearInterval(poll);
      unsub?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Host auto-advances countdown -> active.
  useEffect(() => {
    if (!match || !meId || match.status !== "countdown") return;
    const host = players.find((p) => p.is_host);
    if (!host || host.player_id !== meId) return;
    if (countdownEnd !== null && Date.now() >= countdownEnd && !startedRef.current) {
      startedRef.current = true;
      // Realtime does not echo the host's own change, so set the start time
      // locally for the host's timer.
      const nowIso = new Date().toISOString();
      setPlayers((prev) =>
        prev.map((p) =>
          p.player_id === meId ? { ...p, problem_started_at: nowIso } : p
        )
      );
      beginActive(match.id);
    }
  }, [match, now, meId, players, countdownEnd]);

  // When both players have finished, finalize the match. This is a fallback
  // for the case where the realtime echo of the last player's finish doesn't
  // reach the client that made the change (Supabase does not echo your own
  // changes). We also optimistically set the local status to "finished" so
  // the result popup appears immediately.
  const finalizedRef = useRef(false);
  useEffect(() => {
    if (!match || !meId) return;
    if (match.status === "finished") {
      finalizedRef.current = true;
      return;
    }
    const finishedCount = players.filter((p) => p.finished_at).length;
    if (finishedCount >= 2 && !finalizedRef.current) {
      finalizedRef.current = true;
      finalizeMatchAction(match.id).then(() => {
        setMatch((prev) => (prev ? { ...prev, status: "finished" } : prev));
      });
    }
  }, [match, players, meId]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-semibold">Room {code}</h1>
        <p className="text-neutral-400">{error}</p>
        <button
          onClick={() => router.push("/play")}
          className="rounded-md bg-emerald-600 px-4 py-2 text-white"
        >
          Back to arena
        </button>
      </div>
    );
  }

  if (!match || !problem) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-400">
        Loading battle…
      </div>
    );
  }

  const host = players.find((p) => p.is_host);
  const isHost = host?.player_id === meId;
  const amIParticipant = players.some((p) => p.player_id === meId);

  if (!amIParticipant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-semibold">Room {match.room_code}</h1>
        <p className="text-neutral-400">
          You are not a participant in this room.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-md bg-emerald-600 px-4 py-2 text-white"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const myPlayer = players.find((p) => p.player_id === meId);
  const iFinished = Boolean(myPlayer?.finished_at);
  const bothFinished = players.length >= 2 && players.every((p) => p.finished_at);

  // Show the result popup when the match is finished OR both players have
  // finished (the latter is the reliable signal both clients poll for).
  if (match.status === "finished" || bothFinished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <ResultPopup
          match={match}
          players={players}
          profiles={profiles}
          submissions={submissions}
          meId={meId!}
          onExit={() => router.push("/dashboard")}
        />
      </div>
    );
  }

  if (iFinished) {
    return (
      <WaitingScreen
        players={players}
        profiles={profiles}
        meId={meId!}
        onQuit={() => setShowQuitConfirm(true)}
      />
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        match={match}
        isHost={isHost}
        hasOpponent={players.length >= 2}
        now={now}
        countdownEnd={countdownEnd}
        problemIndex={problemIndex}
        problemCount={problemIds.length}
        myFinishedAt={players.find((p) => p.player_id === meId)?.finished_at ?? null}
        onStart={isHost ? handleStart : undefined}
        onQuit={handleQuit}
      />
      <div className="flex min-h-0 flex-1">
        <ProblemPanel problem={problem} testCases={testCases} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-900/60 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Language
            </span>
            <Select
              value={language}
              onValueChange={(v) => handleLanguageChange(v as LanguageId)}
            >
              <SelectTrigger className="h-8 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-h-0 flex-1">
            <Editor
              height="100%"
              language={getLanguage(language).monaco}
              theme="vs-dark"
              value={code_}
              onChange={(v) => setCode_(v ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
          <ConsolePanel
            runResult={runResult}
            running={running}
            submitting={submitting}
            submitted={submittedCurrent}
            status={match.status}
            onRun={handleRun}
            onSubmit={handleSubmit}
            onNext={handleNext}
            hasNext={problemIndex + 1 < problemIds.length}
          />
        </div>
        <OpponentPanel
          players={players}
          profiles={profiles}
          submissions={submissions}
          meId={meId!}
          onAcceptDefeat={handleAcceptDefeat}
        />
      </div>
      {showQuitConfirm && (
        <QuitConfirmModal
          quitting={quitting}
          onCancel={() => setShowQuitConfirm(false)}
          onConfirm={handleConfirmQuit}
        />
      )}
    </div>
  );

  async function handleRun() {
    if (running) return;
    setRunning(true);
    const result = await runSolution(code_, problem!.function_name, testCases, language);
    setRunResult(result);
    setRunning(false);
  }

  async function handleStart() {
    if (!match) return;
    // Supabase Realtime does not echo changes back to the client that made
    // them, so the host sets the countdown locally and optimistically updates
    // the match status.
    setCountdownEnd(Date.now() + 5000);
    setMatch({ ...match, status: "countdown" });
    await startMatch(match.id);
  }

  async function handleSubmit() {
    if (submitting || !problem) return;
    setSubmitting(true);
    const result = await runSolution(code_, problem.function_name, testCases, language);
    await submitSolution(
      match!.id,
      problem.id,
      problemIndex,
      code_,
      result.testsPassed,
      result.testsTotal,
      language
    );
    setRunResult(result);
    setSubmittedCurrent(true);
    setSubmitting(false);

    // Realtime does not echo our own changes back, so after submitting the
    // last problem we optimistically mark ourselves finished (routes to the
    // lobby immediately) and refetch the authoritative state to detect when
    // the opponent has also finished.
    if (problemIndex + 1 >= problemIds.length) {
      const nowIso = new Date().toISOString();
      myFinishedRef.current = nowIso;
      const m = await getMatchByCode(code);
      const ps = await getMatchPlayers(match!.id);
      // Ensure our own finished_at is present even if the server write lagged.
      const merged = ps.map((p) =>
        p.player_id === meId && !p.finished_at ? { ...p, finished_at: nowIso } : p
      );
      if (m) {
        matchRef.current = m;
        setMatch(m);
      }
      playersRef.current = merged;
      setPlayers(merged);
      if (m?.status === "finished" || merged.filter((p) => p.finished_at).length >= 2) {
        setMatch((prev) => (prev ? { ...prev, status: "finished" } : prev));
      }
    }
  }

  function handleNext() {
    // The server already advanced this player's index; the realtime callback
    // loads the next problem. If it hasn't arrived yet, advance locally.
    const nextIdx = problemIndex + 1;
    if (nextIdx >= problemIds.length) return;
    problemIndexRef.current = nextIdx;
    setProblemIndex(nextIdx);
    setSubmittedCurrent(false);
    setRunResult(null);
    const pid = problemIds[nextIdx];
    if (pid) {
      getProblemClient(pid).then((p) => {
        if (p) {
          setProblem(p);
          codeRef.current = p.starter_code;
          setCode_(p.starter_code);
        }
      });
      getTestCasesClient(pid).then(setTestCases);
    }
  }

  function handleLanguageChange(next: LanguageId) {
    if (next === language) return;
    setLanguage(next);
    if (problem) {
      setCode_(starterFor(next, problem));
    }
  }

  async function handleAcceptDefeat() {
    if (!match) return;
    await acceptDefeat(match.id);
  }

  function handleQuit() {
    setShowQuitConfirm(true);
  }

  async function handleConfirmQuit() {
    if (quitting || !match) return;
    setQuitting(true);
    // Forfeit: the opponent becomes the winner. If there's no opponent yet,
    // just leave the room without recording a result.
    const opp = players.find((p) => p.player_id !== meId);
    if (opp) {
      await acceptDefeat(match.id);
    }
    router.push("/dashboard");
  }
}

function TopBar({
  match,
  isHost,
  hasOpponent,
  now,
  countdownEnd,
  problemIndex,
  problemCount,
  myFinishedAt,
  onStart,
  onQuit,
}: {
  match: MatchRow;
  isHost: boolean;
  hasOpponent: boolean;
  now: number;
  countdownEnd: number | null;
  problemIndex: number;
  problemCount: number;
  myFinishedAt: string | null;
  onStart?: () => void;
  onQuit: () => void;
}) {
  // Freeze the timer once this player finishes all problems.
  const elapsed = myFinishedAt
    ? Math.max(0, (new Date(myFinishedAt).getTime() - new Date(match.starts_at ?? myFinishedAt).getTime()) / 1000)
    : match.starts_at
    ? Math.max(0, (now - new Date(match.starts_at).getTime()) / 1000)
    : 0;
  const countdownRemaining = countdownEnd
    ? Math.max(0, Math.ceil((countdownEnd - now) / 1000))
    : 0;

  const canStart = isHost && hasOpponent && (match.status === "waiting" || match.status === "matched");

  return (
    <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-500">Room {match.room_code}</span>
        {problemCount > 1 && (
          <span className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-300">
            Problem {problemIndex + 1}/{problemCount}
          </span>
        )}
        {match.status === "countdown" && (
          <span className="rounded bg-emerald-500/15 px-2 py-1 text-sm font-bold text-emerald-400">
            {countdownRemaining}
          </span>
        )}
        {!hasOpponent && isHost && (
          <span className="rounded bg-amber-500/15 px-2 py-1 text-xs text-amber-300">
            Waiting for opponent
          </span>
        )}
      </div>

      <div className="text-2xl font-mono font-bold tracking-wider">
        {match.status === "active" || match.status === "evaluating"
          ? formatTime(elapsed)
          : "--:--"}
      </div>

      <div className="flex items-center gap-3">
        {canStart && onStart && (
          <button
            onClick={onStart}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Start match
          </button>
        )}
        {!hasOpponent && isHost && (
          <span className="text-sm text-neutral-500">
            Share code: <span className="font-mono text-emerald-400">{match.room_code}</span>
          </span>
        )}
        <button
          onClick={onQuit}
          className="rounded-md border border-neutral-700 px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800"
        >
          Quit
        </button>
      </div>
    </header>
  );
}

function ProblemPanel({
  problem,
  testCases,
}: {
  problem: Problem;
  testCases: TestCase[];
}) {
  return (
    <aside className="w-80 min-h-0 shrink-0 overflow-y-auto border-r border-neutral-800 bg-neutral-900/30 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{problem.title}</h2>
        <DifficultyBadge d={problem.difficulty} />
      </div>
      <p className="mt-1 text-sm text-neutral-500">{problem.category}</p>
      <div className="mt-4 text-sm leading-relaxed text-neutral-300">
        <p>{problem.description}</p>
      </div>

      {problem.constraints && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Constraints
          </h3>
          <p className="mt-2 text-sm text-neutral-400">{problem.constraints}</p>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Sample tests
        </h3>
        <div className="mt-2 space-y-2">
          {testCases
            .filter((t) => t.is_sample)
            .map((t) => (
              <div key={t.id} className="rounded bg-neutral-900 p-3 font-mono text-xs">
                <div className="text-neutral-500">Input</div>
                <div className="text-neutral-200">{JSON.stringify(t.input)}</div>
                <div className="mt-1 text-neutral-500">Expected</div>
                <div className="text-emerald-300">{JSON.stringify(t.expected_output)}</div>
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
}

function OpponentPanel({
  players,
  profiles,
  submissions,
  meId,
  onAcceptDefeat,
}: {
  players: MatchPlayerRow[];
  profiles: Record<string, ProfileRow>;
  submissions: SubmissionRow[];
  meId: string;
  onAcceptDefeat: () => void;
}) {
  const host = players.find((p) => p.is_host);
  const guest = players.find((p) => !p.is_host);
  const mySlot = host?.player_id === meId ? host : guest;
  const oppSlot = host?.player_id === meId ? guest : host;
  const oppFinished = Boolean(oppSlot?.finished_at);
  const iFinished = Boolean(mySlot?.finished_at);

  return (
    <aside className="w-72 min-h-0 shrink-0 overflow-y-auto border-l border-neutral-800 bg-neutral-900/30 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Players
      </h3>
      <PlayerCard
        label="You"
        profile={mySlot ? profiles[mySlot.player_id] : undefined}
        submission={mySlot ? submissions.find((s) => s.player_id === mySlot.player_id) : undefined}
        finished={iFinished}
      />
      <div className="my-4 flex items-center gap-2 text-neutral-600">
        <div className="h-px flex-1 bg-neutral-800" />
        <span className="text-xs font-bold">VS</span>
        <div className="h-px flex-1 bg-neutral-800" />
      </div>
      <PlayerCard
        label={oppSlot ? "Opponent" : "Waiting…"}
        profile={oppSlot ? profiles[oppSlot.player_id] : undefined}
        submission={oppSlot ? submissions.find((s) => s.player_id === oppSlot.player_id) : undefined}
        finished={oppFinished}
      />

      {oppFinished && !iFinished && (
        <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-center">
          <p className="text-sm text-amber-300">Your opponent finished all problems.</p>
          <button
            onClick={onAcceptDefeat}
            className="mt-3 w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Accept defeat
          </button>
        </div>
      )}
    </aside>
  );
}

function PlayerCard({
  label,
  profile,
  submission,
  finished,
}: {
  label: string;
  profile?: ProfileRow;
  submission?: SubmissionRow;
  finished?: boolean;
}) {
  return (
    <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-black">
          {(profile?.username ?? "?")[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-neutral-200">{profile?.username ?? "—"}</p>
          <p className="text-sm text-neutral-500">{profile?.elo ?? "—"} ELO</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm">
        {submission ? (
          <>
            <span className="text-emerald-400">Submitted</span>
            <span className="text-neutral-500">
              {submission.tests_passed ?? 0}/{submission.tests_total ?? 0}
            </span>
          </>
        ) : (
          <span className="text-neutral-500">No submission yet</span>
        )}
      </div>
      {finished && (
        <div className="mt-2 text-xs font-semibold text-emerald-400">
          ✓ Finished all problems
        </div>
      )}
    </div>
  );
}

function ConsolePanel({
  runResult,
  running,
  submitting,
  submitted,
  status,
  onRun,
  onSubmit,
  onNext,
  hasNext,
}: {
  runResult: TestRunResult | null;
  running: boolean;
  submitting: boolean;
  submitted: boolean;
  status: string;
  onRun: () => void;
  onSubmit: () => void;
  onNext: () => void;
  hasNext: boolean;
}) {
  const canAct = status === "active" || status === "evaluating";
  return (
    <div className="h-48 border-t border-neutral-800 bg-neutral-950">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Test results
        </span>
        <div className="flex gap-2">
          <button
            onClick={onRun}
            disabled={!canAct || running || submitted}
            className="rounded bg-neutral-800 px-4 py-1.5 text-sm font-medium text-neutral-200 hover:bg-neutral-700 disabled:opacity-50"
          >
            {running ? "Running…" : "Run"}
          </button>
          {submitted ? (
            hasNext ? (
              <button
                onClick={onNext}
                className="rounded bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Next problem
              </button>
            ) : (
              <span className="rounded bg-emerald-600/20 px-4 py-1.5 text-sm font-semibold text-emerald-400">
                Finished
              </span>
            )
          ) : (
            <button
              onClick={onSubmit}
              disabled={!canAct || submitting}
              className="rounded bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          )}
        </div>
      </div>
      <div className="overflow-y-auto p-4 font-mono text-xs">
        {runResult?.error ? (
          <p className="text-red-400">{runResult.error}</p>
        ) : runResult ? (
          <div>
            <p className={runResult.testsPassed === runResult.testsTotal ? "text-emerald-400" : "text-amber-400"}>
              {runResult.testsPassed}/{runResult.testsTotal} passed
            </p>
            <div className="mt-2 space-y-1">
              {runResult.results.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={r.pass ? "text-emerald-400" : "text-red-400"}>
                    {r.pass ? "✓" : "✗"}
                  </span>
                  <span className="text-neutral-400">
                    {JSON.stringify(r.input)} → {JSON.stringify(r.actual)}
                    {r.error ? ` (${r.error})` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-neutral-600">
            Press Run to test your solution against the sample cases.
          </p>
        )}
      </div>
    </div>
  );
}

function QuitConfirmModal({
  quitting,
  onCancel,
  onConfirm,
}: {
  quitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-700 bg-neutral-900 p-6 text-center shadow-2xl">
        <h2 className="text-lg font-semibold text-neutral-100">Quit the battle?</h2>
        <p className="mt-2 text-sm text-neutral-400">
          If you quit now, you will be counted as the loser and your opponent
          will win the match.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={quitting}
            className="flex-1 rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
          >
            Keep coding
          </button>
          <button
            onClick={onConfirm}
            disabled={quitting}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {quitting ? "Quitting…" : "Quit & forfeit"}
          </button>
        </div>
      </div>
    </div>
  );
}

function WaitingScreen({
  players,
  profiles,
  meId,
  onQuit,
}: {
  players: MatchPlayerRow[];
  profiles: Record<string, ProfileRow>;
  meId: string;
  onQuit: () => void;
}) {
  const opp = players.find((p) => p.player_id !== meId);
  const oppProfile = opp ? profiles[opp.player_id] : undefined;
  const oppFinished = Boolean(opp?.finished_at);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600/20">
        <span className="text-3xl">🏁</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">You finished all problems!</h1>
        <p className="mt-2 text-neutral-400">
          Waiting for {oppProfile?.username ?? "your opponent"} to finish…
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-sm text-neutral-300">
            {oppFinished ? "Opponent finished — tallying results…" : "Opponent is still coding"}
          </span>
        </div>
      </div>

      <button
        onClick={onQuit}
        className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800"
      >
        Quit
      </button>
    </div>
  );
}

function ResultPopup({
  match,
  players,
  profiles,
  submissions,
  meId,
  onExit,
}: {
  match: MatchRow;
  players: MatchPlayerRow[];
  profiles: Record<string, ProfileRow>;
  submissions: SubmissionRow[];
  meId: string;
  onExit: () => void;
}) {
  const iWon = match.winner_id === meId;
  const me = profiles[meId];
  const myPlayer = players.find((p) => p.player_id === meId);
  const opp = players.find((p) => p.player_id !== meId);
  const oppProfile = opp ? profiles[opp.player_id] : undefined;
  const oppPlayer = opp;
  const mySubs = submissions.filter((s) => s.player_id === meId);
  const oppSubs = opp ? submissions.filter((s) => s.player_id === opp.player_id) : [];
  const myPassed = mySubs.reduce((s, x) => s + (x.tests_passed ?? 0), 0);
  const myTotal = mySubs.reduce((s, x) => s + (x.tests_total ?? 0), 0);
  const oppPassed = oppSubs.reduce((s, x) => s + (x.tests_passed ?? 0), 0);
  const oppTotal = oppSubs.reduce((s, x) => s + (x.tests_total ?? 0), 0);

  const myTime = myPlayer?.finished_at
    ? Math.max(0, (new Date(myPlayer.finished_at).getTime() - new Date(match.starts_at ?? myPlayer.finished_at).getTime()) / 1000)
    : null;
  const oppTime = oppPlayer?.finished_at
    ? Math.max(0, (new Date(oppPlayer.finished_at).getTime() - new Date(match.starts_at ?? oppPlayer.finished_at).getTime()) / 1000)
    : null;

  return (
    <div className="w-full max-w-lg rounded-2xl border border-neutral-700 bg-neutral-900 p-8 text-center shadow-2xl">
      <h1 className={`text-4xl font-extrabold ${iWon ? "text-emerald-400" : match.winner_id ? "text-red-400" : "text-neutral-300"}`}>
        {iWon ? "YOU WON" : match.winner_id ? "YOU LOST" : "DRAW"}
      </h1>
      <p className="mt-2 text-neutral-400">
        {oppProfile?.username ?? "Opponent"} · {oppProfile?.elo ?? "—"} ELO
      </p>

      <div className="mt-8 space-y-3">
        <ResultRow
          label="You"
          username={me?.username ?? "You"}
          passed={myPassed}
          total={myTotal}
          time={myTime}
          xp={myPlayer?.xp_gained ?? null}
          highlight={iWon}
        />
        <ResultRow
          label="Opponent"
          username={oppProfile?.username ?? "Opponent"}
          passed={oppPassed}
          total={oppTotal}
          time={oppTime}
          xp={oppPlayer?.xp_gained ?? null}
          highlight={!iWon && Boolean(match.winner_id)}
        />
      </div>

      <button
        onClick={onExit}
        className="mt-8 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
      >
        Back to dashboard
      </button>
    </div>
  );
}

function ResultRow({
  label,
  username,
  passed,
  total,
  time,
  xp,
  highlight,
}: {
  label: string;
  username: string;
  passed: number;
  total: number;
  time: number | null;
  xp: number | null;
  highlight: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 text-left ${
        highlight ? "border-emerald-500/50 bg-emerald-500/10" : "border-neutral-800 bg-neutral-900/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
          <p className="font-medium text-neutral-200">{username}</p>
        </div>
        {highlight && <span className="text-xs font-bold text-emerald-400">WINNER</span>}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-neutral-100">
            {passed}/{total}
          </p>
          <p className="text-xs text-neutral-500">Tests</p>
        </div>
        <div>
          <p className="text-lg font-bold text-neutral-100">{time != null ? formatTime(time) : "—"}</p>
          <p className="text-xs text-neutral-500">Time</p>
        </div>
        <div>
          <p className="text-lg font-bold text-emerald-400">{xp != null ? `+${xp}` : "—"}</p>
          <p className="text-xs text-neutral-500">XP</p>
        </div>
      </div>
    </div>
  );
}

function DifficultyBadge({ d }: { d: string }) {
  const color =
    d === "easy"
      ? "bg-emerald-500/15 text-emerald-400"
      : d === "medium"
      ? "bg-amber-500/15 text-amber-400"
      : "bg-red-500/15 text-red-400";
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {d}
    </span>
  );
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
