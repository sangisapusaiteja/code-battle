"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { categorySlug, cn } from "@/lib/utils";

const arrowClass =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.22)] transition-all duration-300 hover:bg-emerald-500/10 hover:text-emerald-300 hover:shadow-[0_0_16px_rgba(34,197,94,0.45)] disabled:pointer-events-none disabled:text-neutral-600 disabled:opacity-40 disabled:shadow-none";

export default function CategoryNav({
  categories,
  signedIn,
}: {
  categories: string[];
  signedIn: boolean;
}) {
  const pathname = usePathname();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    syncArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", syncArrows, { passive: true });
    window.addEventListener("resize", syncArrows);
    return () => {
      el.removeEventListener("scroll", syncArrows);
      window.removeEventListener("resize", syncArrows);
    };
  }, [syncArrows, categories.length]);

  function scrollCategories(direction: -1 | 1) {
    scrollerRef.current?.scrollBy({ left: direction * 240, behavior: "smooth" });
  }

  function handleCategoryClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    slug: string,
  ) {
    // Already on the dashboard: smooth-scroll to the section instead of reloading.
    if (pathname !== "/dashboard") return;
    const section = document.getElementById(slug);
    if (!section) return;
    e.preventDefault();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${slug}`);
  }

  return (
    <nav
      aria-label="Problem categories"
      className="hidden min-w-0 flex-1 items-center gap-1 lg:flex"
    >
      {signedIn && (
        <Link
          href="/dashboard"
          aria-label="Dashboard"
          title="Dashboard"
          aria-current={pathname === "/dashboard" ? "page" : undefined}
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-200",
            pathname === "/dashboard"
              ? "text-emerald-400"
              : "text-neutral-400 hover:text-neutral-100",
          )}
        >
          <Home className="h-4 w-4" />
        </Link>
      )}

      {categories.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => scrollCategories(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll categories left"
            className={arrowClass}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={scrollerRef}
            className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 text-sm whitespace-nowrap"
          >
            {categories.map((category) => {
              const slug = categorySlug(category);
              return (
                <Link
                  key={category}
                  href={`/dashboard#${slug}`}
                  onClick={(e) => handleCategoryClick(e, slug)}
                  className="relative shrink-0 rounded-md px-2.5 py-2 text-sm font-medium text-neutral-400 transition-colors duration-200 hover:text-neutral-100"
                >
                  {category}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollCategories(1)}
            disabled={!canScrollRight}
            aria-label="Scroll categories right"
            className={arrowClass}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      <a
        href="https://interviewhandbook.tejaverse.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium whitespace-nowrap text-neutral-400 transition-colors duration-200 hover:text-neutral-100"
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>Interview Handbook</span>
      </a>
    </nav>
  );
}
