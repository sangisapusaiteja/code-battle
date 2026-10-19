"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { categorySlug } from "@/lib/utils";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";

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
  const [search, setSearch] = useState("");

  // Arriving from a navbar category link (/dashboard#slug): jump to that section
  // once the rows are mounted, since the hash scroll can't find them earlier.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const section = document.getElementById(hash);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const q = search.trim().toLowerCase();
  const visible = q
    ? problems.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.difficulty.toLowerCase().includes(q)
      )
    : problems;

  const grouped = (() => {
    if (groupBy === "none") return null;

    const map = new Map<string, Problem[]>();

    for (const p of visible) {
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
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Problems{" "}
          {q && <span className="normal-case tracking-normal text-neutral-600">({visible.length} match{visible.length === 1 ? "" : "es"})</span>}
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems…"
              className="w-44 rounded-lg border border-neutral-700 bg-neutral-900/60 py-1.5 pl-8 pr-8 text-xs text-neutral-200 outline-none transition-colors duration-200 focus:border-emerald-500/40 placeholder:text-neutral-600 sm:w-56"
            />
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <span className="hidden sm:inline text-xs text-neutral-500">Group by</span>
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

      {visible.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-8 text-center">
          <p className="text-sm text-neutral-500">No problems match “{search}”.</p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-xs font-semibold text-emerald-400 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : groupBy === "none" ? (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped!.map(([key, items]) => (
            <div
              key={key}
              id={groupBy === "category" ? categorySlug(key) : undefined}
              className="scroll-mt-20"
            >
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">{key}</h3>
                <span className="text-xs text-neutral-600">({items.length})</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
  return (
    <Link
      href={`/problem/${problem.slug}`}
      className="group rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 transition-colors duration-300 hover:border-emerald-500/20 hover:bg-neutral-900"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-semibold text-neutral-200 transition-colors group-hover:text-emerald-400">{problem.title}</span>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
      <p className="mt-2 text-xs text-neutral-500">{problem.category}</p>
    </Link>
  );
}
