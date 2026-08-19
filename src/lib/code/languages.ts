export type LanguageId = "javascript";

export interface LanguageDef {
  id: LanguageId;
  label: string;
  monaco: string;
  runnable: boolean;
}

export const LANGUAGES: LanguageDef[] = [
  { id: "javascript", label: "JavaScript", monaco: "javascript", runnable: true },
];

export function getLanguage(id: string): LanguageDef {
  return LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];
}

/**
 * Starter code for a problem.
 */
export function starterFor(
  _language: LanguageId,
  problem: { starter_code: string; function_name: string }
): string {
  return problem.starter_code;
}
