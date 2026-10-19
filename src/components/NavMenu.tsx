"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Home,
  LayoutGrid,
  Menu,
  Swords,
} from "lucide-react";
import { categorySlug, cn } from "@/lib/utils";
import { categoryIcon } from "@/lib/category-icons";

const INTERVIEW_HANDBOOK_URL = "https://interviewhandbook.tejaverse.org/";

type MenuId = "problems" | "play" | "mobile";

const triggerClass =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 transition-colors duration-200 hover:bg-neutral-800/60 hover:text-neutral-100 data-[state=open]:bg-neutral-800/60 data-[state=open]:text-neutral-100";

const contentClass =
  "z-[95] min-w-[210px] rounded-2xl border border-neutral-700 bg-neutral-900 p-2 text-neutral-100 shadow-2xl";

const itemClass =
  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-neutral-200 outline-none transition-colors hover:bg-neutral-800 data-[highlighted]:bg-neutral-800 data-[highlighted]:text-neutral-100";

const separatorClass = "my-1 h-px bg-neutral-800";

function GroupLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu.Label className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-neutral-500">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </DropdownMenu.Label>
  );
}

export default function NavMenu({
  categories,
  signedIn,
}: {
  categories: string[];
  signedIn: boolean;
}) {
  const pathname = usePathname();
  // Controlled so we can close the menu even when a click's default
  // navigation is prevented (which makes Radix skip its own close-on-select).
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const closeMenu = () => setOpenMenu(null);

  // Already on the dashboard: smooth-scroll to the section instead of reloading.
  function handleCategoryClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    slug: string,
  ) {
    closeMenu();
    if (pathname !== "/dashboard") return;
    const section = document.getElementById(slug);
    if (!section) return;
    e.preventDefault();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${slug}`);
  }

  function CategoryLink({ category }: { category: string }) {
    const slug = categorySlug(category);
    const Icon = categoryIcon(category);
    return (
      <DropdownMenu.Item asChild>
        <Link
          href={`/dashboard#${slug}`}
          onClick={(e) => handleCategoryClick(e, slug)}
          className={itemClass}
        >
          <Icon className="h-4 w-4 shrink-0 text-neutral-500" />
          <span className="truncate">{category}</span>
        </Link>
      </DropdownMenu.Item>
    );
  }

  const playItems = (
    <>
      <DropdownMenu.Item asChild>
        <Link href="/play" onClick={closeMenu} className={itemClass}>
          <Swords className="h-4 w-4 shrink-0 text-neutral-500" />
          <span>Arena</span>
        </Link>
      </DropdownMenu.Item>
      <DropdownMenu.Item asChild>
        <Link href="/instructions" onClick={closeMenu} className={itemClass}>
          <BookOpen className="h-4 w-4 shrink-0 text-neutral-500" />
          <span>How it works</span>
        </Link>
      </DropdownMenu.Item>
    </>
  );

  return (
    <div className="flex min-w-0 flex-1 items-center">
      {/* ── Desktop ─────────────────────────────────────────── */}
      <nav
        aria-label="Primary"
        className="hidden min-w-0 flex-1 items-center gap-1 lg:flex"
      >
        {signedIn && (
          <Link
            href="/dashboard"
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            className={cn(triggerClass, pathname === "/dashboard" && "text-neutral-100")}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        )}

        {categories.length > 0 && (
          <DropdownMenu.Root
            open={openMenu === "problems"}
            onOpenChange={(o) => setOpenMenu(o ? "problems" : null)}
          >
            <DropdownMenu.Trigger className={triggerClass}>
              <LayoutGrid className="h-4 w-4" />
              <span>Problems</span>
              <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={8}
                className={cn(contentClass, "max-h-[70vh] w-[260px] overflow-y-auto")}
              >
                <GroupLabel icon={LayoutGrid}>Topics</GroupLabel>
                {categories.map((category) => (
                  <CategoryLink key={category} category={category} />
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}

        <DropdownMenu.Root
          open={openMenu === "play"}
          onOpenChange={(o) => setOpenMenu(o ? "play" : null)}
        >
          <DropdownMenu.Trigger className={triggerClass}>
            <Swords className="h-4 w-4" />
            <span>Play</span>
            <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              sideOffset={8}
              className={contentClass}
            >
              {playItems}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <a
          href={INTERVIEW_HANDBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(triggerClass, "shrink-0")}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Interview Handbook</span>
        </a>
      </nav>

      {/* ── Mobile ──────────────────────────────────────────── */}
      <div className="ml-auto lg:hidden">
        <DropdownMenu.Root
          open={openMenu === "mobile"}
          onOpenChange={(o) => setOpenMenu(o ? "mobile" : null)}
        >
          <DropdownMenu.Trigger
            aria-label="Open menu"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition-colors duration-200 hover:bg-emerald-500/10 hover:text-neutral-100"
          >
            <Menu className="h-4 w-4" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={10}
              className={cn(contentClass, "max-h-[80vh] w-[260px] overflow-y-auto")}
            >
              {signedIn && (
                <DropdownMenu.Item asChild>
                  <Link href="/dashboard" onClick={closeMenu} className={itemClass}>
                    <Home className="h-4 w-4 shrink-0 text-neutral-500" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenu.Item>
              )}

              <GroupLabel icon={Swords}>Play</GroupLabel>
              {playItems}

              {categories.length > 0 && (
                <>
                  <DropdownMenu.Separator className={separatorClass} />
                  <GroupLabel icon={LayoutGrid}>Topics</GroupLabel>
                  {categories.map((category) => (
                    <CategoryLink key={category} category={category} />
                  ))}
                </>
              )}

              <DropdownMenu.Separator className={separatorClass} />
              <DropdownMenu.Item asChild>
                <a
                  href={INTERVIEW_HANDBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className={itemClass}
                >
                  <BookOpen className="h-4 w-4 shrink-0 text-neutral-500" />
                  <span>Interview Handbook</span>
                </a>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
