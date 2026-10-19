import { cn } from "@/lib/utils";
import { difficultyTone } from "@/lib/ui";
import { Badge } from "./badge";

/** Single source for the problem difficulty pill (was copied in 4 places). */
export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: string;
  className?: string;
}) {
  return (
    <Badge tone={difficultyTone(difficulty)} className={cn("capitalize", className)}>
      {difficulty}
    </Badge>
  );
}
