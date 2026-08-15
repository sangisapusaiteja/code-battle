"use client";

import { useActionState } from "react";
import { signUp, type AuthResult } from "@/app/auth/actions";
import PasswordInput from "@/components/PasswordInput";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<AuthResult, FormData>(
    signUp,
    undefined
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900/50 p-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-50">
          Join Code Battle
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Compete, climb the ELO ladder, and stay sharp.
        </p>

        {state?.error && (
          <p className="mt-4 rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-neutral-300">Username</span>
            <input
              name="username"
              autoComplete="username"
              required
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-neutral-300">Password</span>
            <PasswordInput
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Already a player?{" "}
          <a className="font-medium text-emerald-400 hover:underline" href="/login">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
