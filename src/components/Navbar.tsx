import Link from "next/link";
import LogoMark from "./LogoMark";
import NavLinks from "./NavLinks";
import ThemeToggle from "./ThemeToggle";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function Navbar() {
  const session = await getSession();

  let isAdmin = false;
  if (session) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.userId)
      .single();
    isAdmin = data?.role === "admin";
  }

  const links = session
    ? [
        { href: "/", label: "Dashboard", icon: "home" },
        { href: "/leaderboard", label: "Leaderboard", icon: "trophy" },
        { href: "/history", label: "History", icon: "history" },
        { href: "/profile", label: "Profile", icon: "user" },
        ...(isAdmin ? [{ href: "/admin/problems", label: "Admin", icon: "shield" }] : []),
      ]
    : [
        { href: "/login", label: "Login" },
        { href: "/signup", label: "Sign Up" },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-500/10 bg-black/80 backdrop-blur-sm">
      <div className="flex h-14 items-center px-4 md:px-6">
        <Link href="/" className="mr-4 flex shrink-0 items-center gap-2">
          <LogoMark size="sm" />
          <span className="truncate text-lg font-bold tracking-tight">
            <span className="text-neutral-100">Code</span>
            <span className="text-emerald-400">Battle</span>
          </span>
        </Link>

        {session ? <NavLinks links={links} /> : <div className="hidden flex-1 lg:block" />}

        <div className="ml-auto flex items-center gap-2 pl-3">
          <ThemeToggle />
          {session && (
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-700 px-3 text-sm font-medium text-neutral-300 transition-colors duration-200 hover:border-[#ef4444]/40 hover:text-[#ef4444]"
              >
                Logout
              </button>
            </form>
          )}
          {!session && (
            <>
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-700 px-3 text-sm font-medium text-neutral-300 transition-colors duration-200 hover:border-emerald-500/40 hover:text-emerald-400"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center justify-center rounded-md bg-emerald-600 px-3 text-sm font-bold text-white transition-all duration-200 hover:bg-emerald-500"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
