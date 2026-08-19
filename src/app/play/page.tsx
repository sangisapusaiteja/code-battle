"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMatch, joinMatch } from "@/app/match/actions";
import { listProblemsClient, type Problem } from "@/lib/problems/client-data";
import { useEffect } from "react";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const allDifficulties = ["easy", "medium", "hard"];

  function toggleCat(c: string) {
    setCats((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }
  function toggleDiff(d: string) {
    setDiffs((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

  const filtered = problems.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (cats.length > 0 && !cats.includes(p.category)) return false;
    if (diffs.length > 0 && !diffs.includes(p.difficulty)) return false;
    return true;
  });

  function toggleBattle(id: string) {
    setBattleProblems((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  async function handleCreate() {
    if (busy || battleProblems.length === 0) return;
    setBusy(true);
    setError(null);
    const res = await createMatch(battleProblems);
    if ("error" in res) { setError(res.error); setBusy(false); return; }
    router.push(`/battle/${res.code}`);
  }

  async function handleJoin() {
    if (busy) return;
    const normalized = code.trim().toUpperCase();
    if (!normalized) { setError("Enter a room code."); return; }
    setBusy(true);
    setError(null);
    const res = await joinMatch(normalized);
    if ("error" in res) { setError(res.error); setBusy(false); return; }
    router.push(`/battle/${res.code}`);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-3 group">
        <LogoMark size="sm" className="group-hover:border-emerald-500/40 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-300" />
        <span className="text-xl font-extrabold tracking-tight">
          <span className="text-neutral-100">Code</span>
          <span className="text-emerald-400">Battle</span>
        </span>
      </Link>

      <div className="pointer-events-none absolute -top-40 right-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md space-y-5">
        <div className="text-center mb-2">
          <h1 className="text-4xl font-extrabold">
            <span className="text-emerald-400" style={{ textShadow: "0 0 20px rgba(34,197,94,0.4)" }}>Arena</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-400">Choose your battle mode</p>
        </div>

        {/* SOLO */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold">SOLO</span>
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
          <button
            onClick={() => soloProblem && router.push(`/solo/${soloProblem}`)}
            className="mt-4 w-full py-3.5 text-base font-bold rounded-xl border border-neutral-700 text-neutral-200 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5"
          >
            Start Solo
          </button>
        </div>

        {/* BATTLE */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="rounded-md bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 px-2.5 py-1 text-xs font-bold">BATTLE</span>
            <h2 className="text-base font-bold text-neutral-200">1v1 Duel</h2>
          </div>
          <p className="text-sm text-neutral-500">Pick problems. Both players solve them in sequence.</p>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems…"
            className="mt-4 w-full rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm text-neutral-200 outline-none focus:border-emerald-500/40 placeholder:text-neutral-600"
          />

          {/* Difficulty filter */}
          <div className="mt-3">
            <span className="text-xs text-neutral-500">Difficulty</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {allDifficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDiff(d)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all duration-200 ${
                    diffs.includes(d)
                      ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="mt-3">
            <span className="text-xs text-neutral-500">Category</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {allCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCat(c)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all duration-200 ${
                    cats.includes(c)
                      ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-600"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-neutral-800 bg-black p-3">
            {filtered.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-200 hover:bg-emerald-500/5 transition-colors">
                <input
                  type="checkbox"
                  checked={battleProblems.includes(p.id)}
                  onChange={() => toggleBattle(p.id)}
                  className="h-4 w-4 rounded accent-emerald-500"
                />
                <span className="truncate">{p.title}</span>
                <span className="ml-auto text-xs text-neutral-500">{p.difficulty}</span>
              </label>
            ))}
            {filtered.length === 0 && <p className="px-3 py-2 text-sm text-neutral-600">No problems match your filters.</p>}
          </div>
          <button
            onClick={handleCreate}
            disabled={busy || battleProblems.length === 0}
            className="mt-4 w-full py-3.5 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
          >
            {busy ? "Creating…" : `Create Room (${battleProblems.length})`}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-600">or join</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>

        {/* JOIN */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
          <h2 className="mb-4 text-base font-bold text-neutral-200">Join a Room</h2>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
            placeholder="ROOM CODE"
            maxLength={6}
            className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3.5 text-center text-lg tracking-[0.3em] font-mono text-neutral-100 outline-none transition-all duration-200 focus:border-emerald-500/40 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)]"
          />
          <button
            onClick={handleJoin}
            disabled={busy}
            className="mt-4 w-full py-3.5 text-base font-bold rounded-xl border border-neutral-700 text-neutral-200 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5 disabled:opacity-40"
          >
            {busy ? "Joining…" : "Join Room"}
          </button>
        </div>

        {error && (
          <p className="rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/5 p-4 text-center text-sm text-[#ef4444]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
