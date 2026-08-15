import { getProblemBySlug, getTestCases } from "@/lib/problems/data";
import { requireUser } from "@/lib/auth/session";
import Link from "next/link";

export const metadata = { title: "Problem — Code Battle" };

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const problem = await getProblemBySlug(id);

  if (!problem) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-neutral-400">Problem not found.</p>
        <Link href="/dashboard" className="text-emerald-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const testCases = await getTestCases(problem.id);
  const samples = testCases.filter((t) => t.is_sample);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-8">
      <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-200">
        ← Dashboard
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <DifficultyBadge d={problem.difficulty} />
      </div>
      <p className="mt-1 text-sm text-neutral-500">{problem.category}</p>

      <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 text-sm leading-relaxed text-neutral-300">
        {problem.description}
      </div>

      {problem.constraints && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Constraints
          </h3>
          <p className="mt-2 text-sm text-neutral-400">{problem.constraints}</p>
        </div>
      )}

      {samples.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Examples
          </h3>
          <div className="mt-2 space-y-2">
            {samples.map((t) => (
              <div key={t.id} className="rounded bg-neutral-900 p-3 font-mono text-xs">
                <div className="text-neutral-500">Input</div>
                <div className="text-neutral-200">{JSON.stringify(t.input)}</div>
                <div className="mt-1 text-neutral-500">Output</div>
                <div className="text-emerald-300">{JSON.stringify(t.expected_output)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <pre className="mt-4 overflow-x-auto rounded-lg bg-neutral-950 p-4 font-mono text-sm text-emerald-300">
        {problem.starter_code}
      </pre>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/solo/${problem.slug}`}
          className="inline-block rounded-lg bg-neutral-700 px-6 py-3 font-semibold text-white hover:bg-neutral-600"
        >
          Practice solo
        </Link>
        <Link
          href="/play"
          className="inline-block rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
        >
          Battle this problem
        </Link>
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
