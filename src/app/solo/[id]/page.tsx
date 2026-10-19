"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import {
  getProblemBySlugClient,
  getProblemClient,
  getTestCasesClient,
  type Problem,
  type TestCase,
} from "@/lib/problems/client-data";
import { runSolution } from "@/lib/code/runner";
import { submitSolo } from "@/app/match/actions";
import TestResults from "@/components/TestResults";
import SampleCases from "@/components/SampleCases";
import LogoMark from "@/components/LogoMark";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { Button } from "@/components/ui/button";
import QuitSession from "@/components/QuitSession";
import RulesGate from "@/components/RulesGate";
import type { TestRunResult } from "@/types";

export default function SoloPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [code_, setCode_] = useState("");
  const [runResult, setRunResult] = useState<TestRunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const prob = (await getProblemBySlugClient(params.id)) ?? (await getProblemClient(params.id));
      if (!prob) { setError("Problem not found."); return; }
      if (cancelled) return;
      setProblem(prob);
      if (!codeRef.current) { codeRef.current = prob.starter_code; setCode_(prob.starter_code); }
      const tc = await getTestCasesClient(prob.id);
      if (!cancelled) setTestCases(tc);
    }
    init();
    return () => { cancelled = true; };
  }, [params.id]);

  if (error) return (
    <div className="flex w-full min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-neutral-400">{error}</p>
      <Button size="lg" onClick={() => router.push("/play")}>Back to Arena</Button>
    </div>
  );

  if (!problem) return <div className="flex w-full min-h-screen items-center justify-center text-neutral-500">Loading…</div>;

  async function handleRun() {
    if (running) return;
    setRunning(true);
    const result = await runSolution(code_, problem!.function_name, testCases, 5000, problem!.slug);
    setRunResult(result);
    setRunning(false);
  }

  async function handleSubmit() {
    if (submitting || submitted) return;
    setSubmitting(true);
    const result = await runSolution(code_, problem!.function_name, testCases, 5000, problem!.slug);
    setRunResult(result);
    const res = await submitSolo(problem!.id, code_, result.testsPassed, result.testsTotal, "javascript", problem!.difficulty);
    if (res.error) { setError(res.error); }
    else { setSubmitted(true); setXpGained(res.xpGained ?? 0); setShowResult(true); }
    setSubmitting(false);
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-black">
      <RulesGate />
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-emerald-500/5 bg-black px-4">
        <div className="flex items-center gap-3">
          <LogoMark size="xs" />
          <div className="h-4 w-px bg-neutral-700" />
          <span className="text-sm font-semibold text-neutral-200">{problem.title}</span>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold">SOLO PRACTICE</span>
          <QuitSession label="Quit" title="Quit Practice?" message="You'll leave this practice session and return to the arena." confirmLabel="Quit" />
          <LogoMark size="xs" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Problem Panel */}
        <aside className="w-80 min-h-0 shrink-0 overflow-y-auto border-r border-emerald-500/5 bg-black p-5">
          <h2 className="text-lg font-bold text-neutral-100">{problem.title}</h2>
          <p className="mt-1 text-xs text-neutral-500">{problem.category}</p>
          <div className="mt-4 text-sm leading-relaxed text-neutral-300"><p>{problem.description}</p></div>
          {problem.constraints && (
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400/60">Constraints</h3>
              <p className="mt-2 text-sm text-neutral-400">{problem.constraints}</p>
            </div>
          )}
          <SampleCases testCases={testCases} />
        </aside>

        {/* Editor + Console */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center border-b border-emerald-500/5 bg-black px-4">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">JavaScript</span>
          </div>
          <div className="min-h-0 flex-1">
            <Editor height="100%" language="javascript" theme="vs-dark" value={code_} onChange={(v) => setCode_(v ?? "")}
              options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, automaticLayout: true }} />
          </div>
          <div className="flex h-[38%] min-h-0 shrink-0 flex-col border-t border-emerald-500/5 bg-black">
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-neutral-800 px-4">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Test Results</span>
              <div className="flex items-center gap-3">
                {xpGained !== null && <span className="text-sm font-bold text-emerald-400">+{xpGained} XP</span>}
                <Button variant="outline" onClick={handleRun} disabled={running}>
                  {running ? "Running…" : "Run"}
                </Button>
                <Button onClick={handleSubmit} disabled={submitting || submitted}>
                  {submitted ? "Submitted" : submitting ? "Submitting…" : "Submit"}
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 font-mono text-xs">
              {runResult ? (
                <TestResults result={runResult} />
              ) : <p className="text-neutral-600">Press Run to test your solution.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/20 bg-neutral-900 p-8 text-center" style={{ boxShadow: "0 0 40px rgba(34,197,94,0.1)" }}>
            <h2 className="text-3xl font-extrabold text-emerald-400" style={{ textShadow: "0 0 20px rgba(34,197,94,0.4)" }}>
              {xpGained && xpGained > 0 ? "SOLVED" : "SUBMITTED"}
            </h2>
            <p className="mt-3 text-neutral-400">
              {xpGained && xpGained > 0 ? `You earned +${xpGained} XP` : "Try again to earn XP."}
            </p>
            <Button size="lg" className="mt-6 w-full" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

