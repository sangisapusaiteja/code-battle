import { getProblemBySlug, getTestCases } from "@/lib/problems/data";
import { requireUser } from "@/lib/auth/session";
import Link from "next/link";

export const metadata = { title: "Problem — CodeBattle" };

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const problem = await getProblemBySlug(id);

  if (!problem) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-neutral-400">Problem not found.</p>
        <Link href="/dashboard" className="text-emerald-400 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const testCases = await getTestCases(problem.id);
  const samples = testCases.filter((t) => t.is_sample);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 sm:px-6 py-8">
      <Link href="/dashboard" className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-neutral-700 text-neutral-300 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400">
        ← Dashboard
      </Link>

      <div className="mt-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-neutral-100">{problem.title}</h1>
        <DifficultyBadge d={problem.difficulty} />
      </div>
      <p className="mt-1 text-xs text-neutral-500">{problem.category}</p>

      <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 text-sm leading-relaxed text-neutral-300">
        {problem.description}
      </div>

      {problem.constraints && (
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400/60">Constraints</h3>
          <p className="mt-2 text-sm text-neutral-400">{problem.constraints}</p>
        </div>
      )}

      {samples.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400/60">Examples</h3>
          <div className="mt-3 space-y-2">
            {samples.map((t) => (
              <div key={t.id} className="rounded-xl bg-black border border-neutral-800 p-4 font-mono text-xs">
                <div className="text-neutral-500">Input</div>
                <div className="text-neutral-200">{JSON.stringify(t.input)}</div>
                <div className="mt-2 text-neutral-500">Output</div>
                <div className="text-emerald-400">{JSON.stringify(t.expected_output)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <pre className="mt-6 overflow-x-auto rounded-xl bg-black border border-neutral-800 p-5 font-mono text-sm text-emerald-400">
        {problem.starter_code}
      </pre>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link href={`/solo/${problem.slug}`}
          className="px-8 py-3.5 text-base font-semibold rounded-xl border border-neutral-700 text-neutral-200 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5 text-center">
          Practice Solo
        </Link>
        <Link href="/play"
          className="px-8 py-3.5 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-[1.02] text-center">
          Battle This Problem
        </Link>
      </div>
    </div>
  );
}

function DifficultyBadge({ d }: { d: string }) {
  const cls = d === "easy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : d === "medium" ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20" : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20";
  return <span className={`rounded-md px-2.5 py-1 text-xs font-bold border ${cls}`}>{d}</span>;
}
