import type { TestCase } from "@/lib/problems/client-data";

export default function SampleCases({ testCases }: { testCases: TestCase[] }) {
  const samples = testCases.filter((t) => t.is_sample);
  if (samples.length === 0) return null;

  return (
    <div className="mt-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400/60">Examples</h3>
      <div className="mt-2 space-y-3">
        {samples.map((t, i) => (
          <div key={t.id} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                {i + 1}
              </span>
              <span className="text-xs font-semibold text-neutral-300">Example {i + 1}</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div>
                <span className="mb-0.5 block text-[11px] text-neutral-500">Input</span>
                <code className="block whitespace-pre-wrap break-all rounded-lg bg-black px-3 py-2 text-neutral-200">
                  {formatInput(t.input)}
                </code>
              </div>
              <div>
                <span className="mb-0.5 block text-[11px] text-neutral-500">Output</span>
                <code className="block whitespace-pre-wrap break-all rounded-lg bg-black px-3 py-2 text-emerald-300">
                  {JSON.stringify(t.expected_output)}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatInput(input: unknown[]): string {
  if (input.length === 1) {
    const single = input[0];
    if (typeof single === "string") return single;
    if (Array.isArray(single)) {
      if (single.length === 2) {
        const [a, b] = single;
        return `${JSON.stringify(a)}\n${JSON.stringify(b)}`;
      }
    }
  }
  return JSON.stringify(input);
}
