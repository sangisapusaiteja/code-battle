import { getSession } from "@/lib/auth/session";
import Link from "next/link";

export default async function Home() {
  const user = await getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
        Practice coding interviews by competing against real developers
      </p>
      <h1 className="mt-4 max-w-3xl text-5xl font-extrabold tracking-tight sm:text-6xl">
        Code <span className="text-emerald-400">Battle</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-neutral-400">
        Face off against real developers on the same problem, under the same
        clock. Win ELO, keep your streak alive, and climb the leaderboard.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        {user ? (
          <Link
            href="/dashboard"
            className="rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/signup"
              className="rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              Start battling
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-800"
            >
              Sign in
            </Link>
          </>
        )}
      </div>

      <p className="mt-10 max-w-xl text-sm text-neutral-600">
        Real-time 1v1 battles powered by Supabase. Sessions are held in
        httpOnly cookies — no localStorage, no XSS token theft.
      </p>
    </main>
  );
}
