"use client";

import { useActionState } from "react";
import { signUp, type AuthResult } from "@/app/auth/actions";
import PasswordInput from "@/components/PasswordInput";

const features = [
  { icon: "⚔️", title: "Real-time 1v1 Duels", desc: "Race head-to-head against another coder in timed challenges." },
  { icon: "🏆", title: "Climb the Ranks", desc: "Gain XP and ELO with every win. Track your progress on the leaderboard." },
  { icon: "🧠", title: "Sharpen Your Skills", desc: "Practice solo or jump into a match. Multiple languages supported." },
];

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<AuthResult, FormData>(signUp, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 sm:px-6">
      <div className="pointer-events-none absolute -top-40 right-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl">
        {/* Left side — branding */}
        <div className="hidden w-1/2 flex-col justify-between p-10 lg:flex">
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-500/20 bg-black text-xl font-black text-emerald-400" style={{ textShadow: "0 0 15px rgba(34,197,94,0.4)" }}>
              {"</>"}
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-50">
              Code <span className="text-emerald-400" style={{ textShadow: "0 0 15px rgba(34,197,94,0.4)" }}>Battle</span>
            </h1>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-400">
              The competitive coding arena where developers test their skills in real-time head-to-head matches.
            </p>
          </div>
          <div className="mt-10 space-y-5">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="mt-0.5 text-lg">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-100">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side — form */}
        <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-extrabold text-neutral-50">
              Join <span className="text-emerald-400">CodeBattle</span>
            </h2>
            <p className="mt-1 text-sm text-neutral-400">Create an account and start competing.</p>

            {state?.error && (
              <p className="mt-4 rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/5 p-4 text-sm text-[#ef4444]">{state.error}</p>
            )}

            <form action={formAction} className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-neutral-300">Username</span>
                <input name="username" autoComplete="username" required
                  className="mt-2 w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 text-sm text-neutral-100 outline-none transition-all duration-200 focus:border-emerald-500/40 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)]" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-neutral-300">Password</span>
                <div className="mt-2">
                  <PasswordInput name="password" autoComplete="new-password" required minLength={8} />
                </div>
              </label>
              <button type="submit" disabled={pending}
                className="w-full py-3.5 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100">
                {pending ? "Creating account…" : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-400">
              Already a player? <a className="font-semibold text-emerald-400 hover:underline transition-colors" href="/login">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
