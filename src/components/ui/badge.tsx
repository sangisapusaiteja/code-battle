import * as React from "react";
import { cn } from "@/lib/utils";
import { TONE_CLASSES, type Tone } from "@/lib/ui";

export function Badge({
  tone = "neutral",
  className,
  ...props
}: { tone?: Tone } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}
