"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthResult } from "@/app/auth/actions";
import PasswordInput from "@/components/PasswordInput";
import AuthShell from "@/components/auth/AuthShell";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<AuthResult, FormData>(signUp, undefined);

  return (
    <AuthShell
      title="Create your player card"
      description="One account for solo practice and head-to-head battles — start earning XP from your very first solve."
    >
      <div className="w-full rounded-[28px] border border-neutral-800 bg-neutral-900/80 p-6 shadow-[0_30px_120px_-40px_rgba(34,197,94,0.25)] sm:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-50">Sign up</h2>
          <p className="mt-2 text-sm text-neutral-400">Pick a username and password to get started.</p>
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="rounded-2xl border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#ef4444]">
              {state.error}
            </div>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-neutral-200">Username</span>
            <input
              name="username"
              autoComplete="username"
              required
              minLength={3}
              placeholder="choose_a_username"
              disabled={pending}
              className="h-12 w-full rounded-2xl border border-neutral-700 bg-black px-4 text-sm text-neutral-100 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-neutral-200">Password</span>
            <PasswordInput name="password" autoComplete="new-password" required minLength={8} />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-[0_18px_40px_-18px_rgba(34,197,94,0.6)] transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Create account
          </button>

          <p className="text-sm text-neutral-400">
            Already a player?{" "}
            <Link href="/login" className="font-semibold text-emerald-400 transition hover:text-emerald-300">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
