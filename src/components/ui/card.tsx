import * as React from "react";
import { cn } from "@/lib/utils";
import { CARD_SURFACE } from "@/lib/ui";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(CARD_SURFACE, "p-5", className)} {...props} />;
}

/** Section heading row (uppercase eyebrow + optional right-side action). */
export function CardHeader({
  title,
  action,
  className,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)}>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
        {title}
      </h2>
      {action}
    </div>
  );
}
