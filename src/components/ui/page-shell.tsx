import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Full-width page container. Replaces the pattern of nesting two
 * `px-6 sm:px-10 lg:px-14` wrappers, which doubled the gutter.
 */
export function PageShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-14", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  id,
  title,
  subtitle,
  actions,
  className,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header id={id} className={cn("mb-6", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span
              className="text-emerald-400"
              style={{ textShadow: "0 0 20px rgba(34,197,94,0.3)" }}
            >
              {title}
            </span>
          </h1>
          {subtitle && <p className="mt-2 text-neutral-400">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
    </header>
  );
}
