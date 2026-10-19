"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, X } from "lucide-react";
import { createMatch, joinMatch } from "@/app/match/actions";
import { listProblemsClient, type Problem } from "@/lib/problems/client-data";
import { navigateToGame } from "@/lib/rules";
import { PageShell } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_DIFFICULTIES = ["easy", "medium", "hard"];

export default function Play() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [soloProblem, setSoloProblem] = useState<string>("");
  const [battleProblems, setBattleProblems] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [diffs, setDiffs] = useState<string[]>([]);

  useEffect(() => {
    listProblemsClient().then((ps) => {
      setProblems(ps);
      if (ps.length > 0) setSoloProblem(ps[0].id);
    });
  }, []);

  const allCategories = Array.from(new Set(problems.map((p) => p.category))).sort();
  const byId = new Map(problems.map((p) => [p.id, p]));
  const selected = battleProblems
    .map((id) => byId.get(id))
    .filter(Boolean) as Problem[];

  const filtered = problems.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (cats.length > 0 && !cats.includes(p.category)) return false;
    if (diffs.length > 0 && !diffs.includes(p.difficulty)) return false;
    return true;
  });

  function toggleCat(c: string) {
    setCats((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  function toggleDiff(d: string) {
    setDiffs((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

  function toggleBattle(id: string) {
    setBattleProblems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleCreate() {
    if (busy || battleProblems.length === 0) return;
    setBusy(true);
    setError(null);
    const res = await createMatch(battleProblems);
    if ("error" in res) { setError(res.error); setBusy(false); return; }
    navigateToGame(router, `/battle/${res.code}`);
  }

  async function handleJoin() {
    if (busy) return;
    const normalized = code.trim().toUpperCase();
    if (!normalized) { setError("Enter a room code."); return; }
    setBusy(true);
    setError(null);
    const res = await joinMatch(normalized);
    if ("error" in res) { setError(res.error); setBusy(false); return; }
    navigateToGame(router, `/battle/${res.code}`);
  }

  return (
    <div className="relative min-h-screen w-full">
      <div className="pointer-events-none absolute -top-40 right-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />

      <PageShell className="relative z-10 space-y-6 py-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold">
            <span className="text-emerald-400" style={{ textShadow: "0 0 20px rgba(34,197,94,0.4)" }}>Arena</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-400">Choose your battle mode</p>
          <Link href="/instructions" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400/80 transition-colors hover:text-emerald-400 hover:underline">
            <BookOpen className="h-3.5 w-3.5" />
            New here? Read how XP, Elo &amp; battles work
          </Link>
        </div>

        {error && (
          <p className="rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/5 p-4 text-center text-sm text-[#ef4444]">
            {error}
          </p>
        )}

        {/* Quick modes */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* SOLO */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">SOLO</span>
              <h2 className="text-base font-bold text-neutral-200">Practice Mode</h2>
            </div>
            <p className="text-sm text-neutral-500">Solve a single problem on your own.</p>
            <Select value={soloProblem} onValueChange={setSoloProblem}>
              <SelectTrigger className="mt-4 w-full rounded-lg border-neutral-700 bg-black py-3 text-sm">
                <SelectValue placeholder="Select a problem" />
              </SelectTrigger>
              <SelectContent>
                {problems.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title} · {p.difficulty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => soloProblem && navigateToGame(router, `/solo/${soloProblem}`)}
            >
              Start Solo
            </Button>
          </div>

          {/* GROUP — coming soon */}
          <div className="relative overflow-hidden rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 p-6 opacity-80">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-bold text-violet-400">GROUP</span>
              <h2 className="text-base font-bold text-neutral-200">Group Battle</h2>
            </div>
            <p className="text-sm text-neutral-500">Team up and take on rival squads in multiplayer coding wars.</p>
            <Button variant="outline" disabled className="mt-4 w-full">
              Coming Soon
            </Button>
          </div>

          {/* JOIN */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-400">JOIN</span>
              <h2 className="text-base font-bold text-neutral-200">Join a Room</h2>
            </div>
            <p className="text-sm text-neutral-500">Got a code from a friend? Drop it in.</p>
            <input
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
              placeholder="ROOM CODE"
              maxLength={6}
              className="mt-4 w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-neutral-100 outline-none transition-colors duration-200 focus:border-emerald-500/40 placeholder:text-neutral-600"
            />
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={handleJoin}
              disabled={busy}
            >
              {busy ? "Joining…" : "Join Room"}
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-600">or host a battle</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>

        {/* BATTLE builder */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="rounded-md border border-[#f59e0b]/20 bg-[#f59e0b]/10 px-2.5 py-1 text-xs font-bold text-[#f59e0b]">BATTLE</span>
              <h2 className="text-base font-bold text-neutral-200">1v1 Duel</h2>
            </div>
            <span className="rounded-md border border-neutral-700 px-2.5 py-1 text-xs font-bold text-neutral-400">
              {battleProblems.length} picked
            </span>
          </div>
          <p className="text-sm text-neutral-500">Pick problems — both players solve them in sequence.</p>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems…"
            className="mt-4 w-full rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm text-neutral-200 outline-none focus:border-emerald-500/40 placeholder:text-neutral-600"
          />

          {/* Filters */}
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="shrink-0 sm:w-40">
              <span className="text-xs text-neutral-500">Difficulty</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {ALL_DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDiff(d)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors duration-200 ${
                      diffs.includes(d)
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-neutral-700 text-neutral-400 hover:border-neutral-600"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-neutral-500">Category</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {allCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCat(c)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors duration-200 ${
                      cats.includes(c)
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-neutral-700 text-neutral-400 hover:border-neutral-600"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Problem list */}
          <div className="mt-4 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-neutral-800 bg-black p-3">
            {filtered.map((p) => {
              const picked = battleProblems.includes(p.id);
              return (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-200 transition-colors hover:bg-emerald-500/5"
                >
                  <input
                    type="checkbox"
                    checked={picked}
                    onChange={() => toggleBattle(p.id)}
                    className="h-4 w-4 rounded accent-emerald-500"
                  />
                  <span className="truncate">{p.title}</span>
                  <span className="ml-auto text-xs text-neutral-500">{p.difficulty}</span>
                </label>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-neutral-600">No problems match your filters.</p>
            )}
          </div>

          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selected.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleBattle(p.id)}
                  className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 transition-colors duration-200 hover:border-[#ef4444]/40 hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
                  title="Remove"
                >
                  {p.title}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}

          <Button
            size="lg"
            className="mt-4 w-full"
            onClick={handleCreate}
            disabled={busy || battleProblems.length === 0}
          >
            {busy ? "Creating…" : `Create Room (${battleProblems.length})`}
          </Button>
        </div>
      </PageShell>
    </div>
  );
}
