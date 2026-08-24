/**
 * Rules-first entry flow: every trip into a battle or solo session
 * passes through /instructions, then resumes the intended destination.
 */

export const RULES_NEXT_KEY = "cb_rules_next";
export const RULES_PASSED_KEY = "cb_rules_passed";

/** Remember where to resume after the instructions page. */
export function rememberPendingTarget(target: string) {
  try {
    sessionStorage.setItem(RULES_NEXT_KEY, target);
  } catch {}
}

/** Whether the player just came from the instructions page. */
export function consumePassedFlag(): boolean {
  try {
    const ts = Number(sessionStorage.getItem(RULES_PASSED_KEY));
    // Valid for a short window — survives React StrictMode's double-
    // invoked effects while expiring soon after normal use.
    if (ts && Date.now() - ts < 60_000) return true;
    sessionStorage.removeItem(RULES_PASSED_KEY);
  } catch {}
  return false;
}

/**
 * Route the player through /instructions first, remembering the
 * intended game destination for the return trip.
 */
export function navigateToGame(router: { push: (href: string) => void }, target: string): boolean {
  rememberPendingTarget(target);
  router.push("/instructions");
  return true;
}
