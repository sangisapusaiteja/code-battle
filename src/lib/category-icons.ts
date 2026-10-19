import type { ComponentType } from "react";
import {
  ArrowLeftRight,
  Binary,
  Braces,
  Hash,
  LayoutGrid,
  Link as LinkIcon,
  RectangleHorizontal,
  Repeat,
  Sigma,
  SlidersHorizontal,
  TrendingUp,
  Type,
} from "lucide-react";

export type CategoryIcon = ComponentType<{ className?: string }>;

/**
 * Keyword → icon matchers for problem categories. Order matters: more
 * specific names are checked first (e.g. "Matrix (2D Array)" before the
 * generic "array" rule, "LinkedList In-place Reversal" before "Linked List").
 */
const MATCHERS: { test: (c: string) => boolean; icon: CategoryIcon }[] = [
  { test: (c) => c.includes("bit"), icon: Binary },
  { test: (c) => c.includes("hash"), icon: Hash },
  { test: (c) => c.includes("prefix"), icon: Sigma },
  { test: (c) => c.includes("kadane"), icon: TrendingUp },
  { test: (c) => c.includes("sliding") && c.includes("dynamic"), icon: SlidersHorizontal },
  { test: (c) => c.includes("sliding"), icon: RectangleHorizontal },
  { test: (c) => c.includes("matrix"), icon: LayoutGrid },
  {
    test: (c) => c.includes("linked") && (c.includes("reversal") || c.includes("reverse")),
    icon: Repeat,
  },
  { test: (c) => c.includes("linked"), icon: LinkIcon },
  { test: (c) => c.includes("pointer"), icon: ArrowLeftRight },
  { test: (c) => c.includes("string"), icon: Type },
  { test: (c) => c.includes("array"), icon: Braces },
];

/** Pick an icon for a category name, falling back to a generic grid. */
export function categoryIcon(category: string): CategoryIcon {
  const c = category.toLowerCase();
  return MATCHERS.find((m) => m.test(c))?.icon ?? LayoutGrid;
}
