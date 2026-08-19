"use client";

import { useState } from "react";
import Link from "next/link";

type Problem = {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  category: string;
};

type GroupBy = "none" | "difficulty" | "category" | "alpha";

export default function ProblemsGrid({ problems }: { problems: Problem[] }) {
  const [groupBy, setGroupBy] = useState<GroupBy>("category");

  const grouped = (() => {
    if (groupBy === "none") return null;

    const map = new Map<string, Problem[]>();

    for (const p of problems) {
      let key: string;
      if (groupBy === "difficulty") key = p.difficulty;
      else if (groupBy === "category") key = p.category;
      else key = p.title[0].toUpperCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }

    const entries = Array.from(map.entries());

    if (groupBy === "difficulty") {
      const order = ["easy", "medium", "hard"];
      entries.sort(([a], [b]) => order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase()));
    } else if (groupBy === "alpha") {
      entries.sort(([a], [b]) => a.localeCompare(b));
    } else {
      entries.sort(([a], [b]) => a.localeCompare(b));
    }

    return entries;
  })();

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Problems</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Group by</span>
          {(["none", "difficulty", "category", "alpha"] as GroupBy[]).map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                groupBy === g
                  ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                  : "border-neutral-700 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300"
              }`}
            >
              {g === "none" ? "All" : g === "alpha" ? "A-Z" : g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {groupBy === "none" ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {problems.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped!.map(([key, items]) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">{key}</h3>
                <span className="text-xs text-neutral-600">({items.length})</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {items.map((p) => (
                  <ProblemCard key={p.id} problem={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ProblemCard({ problem }: { problem: Problem }) {
  const cls =
    problem.difficulty === "easy"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : problem.difficulty === "medium"
        ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"
        : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20";

  return (
    <Link
      href={`/problem/${problem.slug}`}
      className="group rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 transition-all duration-300 hover:border-emerald-500/20 hover:bg-neutral-900"
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-neutral-200 group-hover:text-emerald-400 transition-colors">{problem.title}</span>
        <span className={`rounded-md px-2.5 py-1 text-xs font-bold border ${cls}`}>{problem.difficulty}</span>
      </div>
      <p className="mt-2 text-xs text-neutral-500">{problem.category}</p>
    </Link>
  );
}
