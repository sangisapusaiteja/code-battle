"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMatch, joinMatch } from "@/app/match/actions";
import { listProblemsClient, type Problem } from "@/lib/problems/client-data";
import { useEffect } from "react";
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

  useEffect(() => {
    listProblemsClient().then((ps) => {
      setProblems(ps);
      if (ps.length > 0) setSoloProblem(ps[0].id);
    });
  }, []);

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
    if ("error" in res) {
      setError(res.error);
      setBusy(false);
      return;
    }
    router.push(`/battle/${res.code}`);
  }

  async function handleJoin() {
    if (busy) return;
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError("Enter a room code.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await joinMatch(normalized);
    if ("error" in res) {
      setError(res.error);
      setBusy(false);
      return;
    }
    router.push(`/battle/${res.code}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Enter the arena</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Practice solo, or battle a friend.
          </p>
        </div>

        {/* SOLO — single select */}
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
          <h2 className="text-sm font-semibold text-neutral-300">Solo</h2>
          <p className="text-sm text-neutral-500">
            Solve one problem on your own.
          </p>
          <Select value={soloProblem} onValueChange={setSoloProblem}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a problem" />
            </SelectTrigger>
            <SelectContent>
              {problems.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title} · {p.difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => soloProblem && router.push(`/solo/${soloProblem}`)}
            className="w-full rounded-lg bg-neutral-700 py-3 font-semibold text-white hover:bg-neutral-600"
          >
            Start solo
          </button>
        </div>

        {/* BATTLE — multi select */}
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
          <h2 className="text-sm font-semibold text-neutral-300">Battle</h2>
          <p className="text-sm text-neutral-500">
            Pick one or more problems. Both players solve them in sequence.
          </p>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-neutral-800 p-2">
            {problems.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                <input
                  type="checkbox"
                  checked={battleProblems.includes(p.id)}
                  onChange={() => toggleBattle(p.id)}
                  className="h-4 w-4 accent-emerald-500"
                />
                <span className="truncate">{p.title}</span>
                <span className="ml-auto text-xs text-neutral-500">{p.difficulty}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleCreate}
            disabled={busy || battleProblems.length === 0}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? "Creating…" : `Create room (${battleProblems.length})`}
          </button>
        </div>

        <div className="flex items-center gap-3 text-neutral-600">
          <div className="h-px flex-1 bg-neutral-800" />
          <span className="text-xs uppercase">or join</span>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
          <h2 className="text-sm font-semibold text-neutral-300">Join a room</h2>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Room code (e.g. AB72K9)"
            maxLength={6}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-4 py-3 text-center text-lg tracking-widest text-neutral-100 uppercase outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleJoin}
            disabled={busy}
            className="w-full rounded-lg border border-neutral-700 py-3 font-semibold text-neutral-200 hover:bg-neutral-800 disabled:opacity-60"
          >
            {busy ? "Joining…" : "Join room"}
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
