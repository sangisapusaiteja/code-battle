import Link from "next/link";
import CategoryNav from "./CategoryNav";
import ThemeToggle from "./ThemeToggle";
import BugReport from "./BugReport";
import UserMenu from "./UserMenu";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@/lib/problems/data";

export default async function Navbar() {
  const session = await getSession();

  let username: string | null = null;
  let avatarUrl: string | null = null;
  let isAdmin = false;

  if (session) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("users")
      .select("username, avatar_url, role")
      .eq("id", session.userId)
      .single();
    username = data?.username ?? session.username ?? null;
    avatarUrl = data?.avatar_url ?? null;
    isAdmin = data?.role === "admin";
  }

  // Categories are a table of contents for the dashboard problem sections.
  const categories = session ? await listCategories() : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-black">
      <div className="flex h-14 items-center px-4 md:px-6">
        <Link
          href={session ? "/dashboard" : "/"}
          className="mr-4 flex shrink-0 items-center gap-2"
        >
          <span
            aria-hidden
            className="text-lg font-black leading-none text-emerald-400"
          >
            {"</>"}
          </span>
          <span className="truncate text-lg font-bold tracking-tight">
            <span className="text-neutral-100">Code</span>
            <span className="text-emerald-400">Battle</span>
          </span>
        </Link>

        <CategoryNav categories={categories} signedIn={Boolean(session)} />

        <div className="ml-auto flex items-center gap-2 pl-3">
          <BugReport
            iconOnly
            triggerClassName="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition-colors duration-200 hover:bg-emerald-500/10 hover:text-neutral-100"
          />
          {session && username ? (
            <UserMenu username={username} avatarUrl={avatarUrl} isAdmin={isAdmin} />
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-700 bg-black px-3 text-sm font-medium text-neutral-300 transition-colors duration-200 hover:border-emerald-500/40 hover:text-emerald-400"
            >
              Sign in
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
