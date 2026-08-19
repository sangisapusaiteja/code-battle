import type { TestRunResult } from "@/types";

export default function TestResults({ result }: { result: TestRunResult }) {
  if (result.error) {
    return <p className="text-[#ef4444]">{result.error}</p>;
  }

  const allPassed = result.testsPassed === result.testsTotal && result.testsTotal > 0;

  return (
    <div>
      <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Results</span>
        <span className={`text-sm font-bold ${allPassed ? "text-emerald-400" : "text-[#f59e0b]"}`}>
          {result.testsPassed}/{result.testsTotal} passed
        </span>
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
        {result.results.map((r, i) => (
          <div
            key={i}
            className={`w-64 shrink-0 rounded-lg border p-3 ${r.pass ? "border-emerald-500/20 bg-emerald-500/5" : "border-[#ef4444]/20 bg-[#ef4444]/5"}`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className={`text-sm font-bold ${r.pass ? "text-emerald-400" : "text-[#ef4444]"}`}>
                {r.pass ? "✓" : "✗"}
              </span>
              <span className="text-xs font-semibold text-neutral-500">Test Case {i + 1}</span>
              {r.pass ? (
                <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                  Passed
                </span>
              ) : (
                <span className="ml-auto rounded-full bg-[#ef4444]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#ef4444]">
                  Failed
                </span>
              )}
            </div>
            <div className="grid gap-1 font-mono text-xs">
              <div className="flex gap-2">
                <span className="w-16 shrink-0 text-neutral-500">Input</span>
                <span className="break-all text-neutral-200">{JSON.stringify(r.input)}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-16 shrink-0 text-neutral-500">Expected</span>
                <span className="break-all text-neutral-200">{JSON.stringify(r.expected)}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-16 shrink-0 text-neutral-500">Output</span>
                <span className={`break-all ${r.pass ? "text-emerald-400" : "text-[#ef4444]"}`}>
                  {r.error ? `Error: ${r.error}` : JSON.stringify(r.actual)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
