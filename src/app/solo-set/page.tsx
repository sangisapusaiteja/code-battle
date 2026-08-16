"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import { getProblemClient, getTestCasesClient, type Problem, type TestCase } from "@/lib/problems/client-data";
import { runSolution } from "@/lib/code/runner";
import { LANGUAGES, getLanguage, starterFor, type LanguageId } from "@/lib/code/languages";
import { submitSoloSet } from "@/app/match/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LogoMark from "@/components/LogoMark";
import type { TestRunResult } from "@/types";

interface SetResult { problemId: string; title: string; correct: boolean; xpGained: number; }

export default function SoloSetPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-neutral-500">Loading…</div>}>
      <SoloSetInner />
    </Suspense>
  );
}

function SoloSetInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [index, setIndex] = useState(0);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [code_, setCode_] = useState("");
  const [language, setLanguage] = useState<LanguageId>("javascript");
  const [runResult, setRunResult] = useState<TestRunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<SetResult[]>([]);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<string | null>(null);
  const problem = problems[index] ?? null;

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean);
      if (ids.length === 0) { setError("No problems selected."); return; }
      const loaded: Problem[] = [];
      for (const id of ids) { const p = await getProblemClient(id); if (p) loaded.push(p); }
      if (cancelled) return;
      if (loaded.length === 0) { setError("No valid problems found."); return; }
      setProblems(loaded);
      const tc = await getTestCasesClient(loaded[0].id);
      if (!cancelled) { setTestCases(tc); codeRef.current = loaded[0].starter_code; setCode_(loaded[0].starter_code); }
    }
    init();
    return () => { cancelled = true; };
  }, [searchParams]);

  async function handleRun() {
    if (running || !problem) return;
    setRunning(true);
    const result = await runSolution(code_, problem.function_name, testCases, language);
    setRunResult(result);
    setRunning(false);
  }

  async function handleSubmit() {
    if (submitting || submitted || !problem) return;
    setSubmitting(true);
    const result = await runSolution(code_, problem.function_name, testCases, language);
    setRunResult(result);
    const res = await submitSoloSet(problem.id, code_, result.testsPassed, result.testsTotal, language);
    if (res.error) { setError(res.error); }
    else { setSubmitted(true); setResults((prev) => [...prev, { problemId: problem.id, title: problem.title, correct: res.correct ?? false, xpGained: res.xpGained ?? 0 }]); }
    setSubmitting(false);
  }

  function handleNext() {
    if (index + 1 >= problems.length) { setFinished(true); return; }
    const next = index + 1; setIndex(next); setSubmitted(false); setRunResult(null);
    codeRef.current = problems[next].starter_code; setCode_(problems[next].starter_code);
    getTestCasesClient(problems[next].id).then(setTestCases);
  }

  function handleLanguageChange(next: LanguageId) {
    if (next === language || !problem) return; setLanguage(next); setCode_(starterFor(next, problem));
  }

  if (error) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-neutral-400">{error}</p>
      <button onClick={() => router.push("/play")} className="px-8 py-3.5 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-105">Back to Arena</button>
    </div>
  );

  if (finished) {
    const totalXp = results.reduce((s, r) => s + r.xpGained, 0);
    const solved = results.filter((r) => r.correct).length;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-extrabold text-emerald-400" style={{ textShadow: "0 0 20px rgba(34,197,94,0.4)" }}>SET COMPLETE</h1>
        <p className="mt-3 text-neutral-400">{solved}/{results.length} solved · <span className="text-emerald-400 font-bold">+{totalXp} XP</span></p>
        <div className="mt-6 w-full max-w-md space-y-2">
          {results.map((r) => (
            <div key={r.problemId} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-4">
              <span className="font-medium text-neutral-200">{r.title}</span>
              <span className={`rounded-md px-2.5 py-1 text-xs font-bold border ${r.correct ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20"}`}>
                {r.correct ? `SOLVED +${r.xpGained} XP` : "ATTEMPTED"}
              </span>
            </div>
          ))}
        </div>
        <button onClick={() => router.push("/dashboard")}
          className="mt-8 px-8 py-3.5 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-105">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!problem) return <div className="flex min-h-screen items-center justify-center text-neutral-500">Loading…</div>;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-emerald-500/5 bg-black px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/play")} className="text-sm text-neutral-400 hover:text-emerald-400 transition-colors duration-200">← Arena</button>
          <div className="h-4 w-px bg-neutral-700" />
          <span className="text-sm font-semibold text-neutral-200">{problem.title}</span>
          <DifficultyBadge d={problem.difficulty} />
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold">{index + 1}/{problems.length}</span>
          <span className="rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold">SOLO SET</span>
          <LogoMark size="xs" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-80 min-h-0 shrink-0 overflow-y-auto border-r border-emerald-500/5 bg-black p-5">
          <h2 className="text-lg font-bold text-neutral-100">{problem.title}</h2>
          <p className="mt-1 text-xs text-neutral-500">{problem.category}</p>
          <div className="mt-4 text-sm leading-relaxed text-neutral-300"><p>{problem.description}</p></div>
          {problem.constraints && (
            <div className="mt-5"><h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400/60">Constraints</h3><p className="mt-2 text-sm text-neutral-400">{problem.constraints}</p></div>
          )}
          <div className="mt-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400/60">Test Cases</h3>
            <div className="mt-2 space-y-2">
              {testCases.filter((t) => t.is_sample).map((t) => (
                <div key={t.id} className="rounded-lg bg-black border border-neutral-800 p-3 font-mono text-xs">
                  <div className="text-neutral-500">Input</div><div className="text-neutral-200">{JSON.stringify(t.input)}</div>
                  <div className="mt-1 text-neutral-500">Expected</div><div className="text-emerald-400">{JSON.stringify(t.expected_output)}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-emerald-500/5 bg-black px-4 py-2.5">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Language</span>
            <Select value={language} onValueChange={(v) => handleLanguageChange(v as LanguageId)}>
              <SelectTrigger className="h-9 w-44 rounded-lg border-neutral-700 bg-black text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGES.map((l) => (<SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="min-h-0 flex-1">
            <Editor height="100%" language={getLanguage(language).monaco} theme="vs-dark" value={code_} onChange={(v) => setCode_(v ?? "")}
              options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, automaticLayout: true }} />
          </div>
          <div className="h-52 border-t border-emerald-500/5 bg-black">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2.5">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Test Results</span>
              <div className="flex items-center gap-3">
                <button onClick={handleRun} disabled={running}
                  className="px-5 py-2 text-sm font-semibold rounded-lg border border-neutral-700 text-neutral-200 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-40">
                  {running ? "Running…" : "Run"}
                </button>
                {!submitted ? (
                  <button onClick={handleSubmit} disabled={submitting}
                    className="px-5 py-2 text-sm font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-105 disabled:opacity-40">
                    {submitting ? "Submitting…" : "Submit"}
                  </button>
                ) : (
                  <button onClick={handleNext}
                    className="px-5 py-2 text-sm font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-105">
                    {index + 1 >= problems.length ? "Finish" : "Next Problem"}
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto p-4 font-mono text-xs">
              {runResult?.error ? <p className="text-[#ef4444]">{runResult.error}</p> : runResult ? (
                <div>
                  <p className={runResult.testsPassed === runResult.testsTotal ? "text-emerald-400 font-bold" : "text-[#f59e0b]"}>{runResult.testsPassed}/{runResult.testsTotal} passed</p>
                  <div className="mt-2 space-y-1">
                    {runResult.results.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={r.pass ? "text-emerald-400" : "text-[#ef4444]"}>{r.pass ? "✓" : "✗"}</span>
                        <span className="text-neutral-400">{JSON.stringify(r.input)} → {JSON.stringify(r.actual)}{r.error ? ` (${r.error})` : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="text-neutral-600">Press Run to test your solution.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DifficultyBadge({ d }: { d: string }) {
  const cls = d === "easy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : d === "medium" ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20" : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20";
  return <span className={`rounded-md px-2.5 py-1 text-xs font-bold border ${cls}`}>{d}</span>;
}
