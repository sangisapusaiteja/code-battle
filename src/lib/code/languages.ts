export type LanguageId = "javascript" | "typescript" | "python";

export interface LanguageDef {
  id: LanguageId;
  label: string;
  monaco: string;
  runnable: boolean;
}

export const LANGUAGES: LanguageDef[] = [
  { id: "javascript", label: "JavaScript", monaco: "javascript", runnable: true },
  { id: "typescript", label: "TypeScript", monaco: "typescript", runnable: true },
  { id: "python", label: "Python", monaco: "python", runnable: true },
];

export function getLanguage(id: string): LanguageDef {
  return LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];
}

/**
 * Per-language starter code for a problem. Falls back to the problem's
 * default (JS) starter code when a language has no specific template.
 */
export function starterFor(
  language: LanguageId,
  problem: { starter_code: string; function_name: string }
): string {
  const jsArgs = deriveArgs(problem.starter_code);

  switch (language) {
    case "javascript":
      return problem.starter_code;
    case "typescript":
      return `function ${problem.function_name}(${jsArgs}): unknown {\n  // TODO: implement\n}\n`;
    case "python":
      return `def ${problem.function_name}(${jsArgs}):\n    # TODO: implement\n    pass\n`;
    default:
      return problem.starter_code;
  }
}

/** Extract the parameter list from a JS function signature, e.g. "(nums, target)". */
function deriveArgs(starterCode: string): string {
  const m = /function\s+\w+\s*\(([^)]*)\)/.exec(starterCode);
  if (!m) return "args";
  return m[1]
    .split(",")
    .map((s) => s.trim().split("=")[0].trim())
    .filter(Boolean)
    .join(", ");
}
