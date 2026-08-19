import type { TestRunResult } from "@/types";
import type { TestCase } from "@/lib/problems/client-data";

/**
 * Runs a user's JavaScript solution against a set of test cases.
 * Executes via `new Function` in an isolated scope.
 */
export async function runSolution(
  source: string,
  functionName: string,
  testCases: TestCase[],
  timeoutMs = 5000
): Promise<TestRunResult> {
  const results: TestRunResult["results"] = [];

  let fn: ((...args: unknown[]) => unknown) | null = null;
  try {
    const runner = new Function(
      `"use strict";\n${source}\nreturn (typeof ${functionName} === "function") ? ${functionName} : null;`
    );
    fn = runner();
  } catch (e) {
    return {
      testsPassed: 0,
      testsTotal: testCases.length,
      results: [],
      error: `Syntax error: ${(e as Error).message}`,
    };
  }

  if (!fn) {
    return {
      testsPassed: 0,
      testsTotal: testCases.length,
      results: [],
      error: `Function "${functionName}" was not found.`,
    };
  }

  const arity = fn.length;

  for (const test of testCases) {
    let actual: unknown;
    let error: string | undefined;
    try {
      const args = buildArgs(arity, test.input);
      const firstArg = args[0];
      actual = await executeWithTimeout(() => fn?.(...args), timeoutMs);
      if (actual === undefined && Array.isArray(firstArg)) {
        actual = firstArg;
      }
    } catch (e) {
      error = (e as Error).message;
    }
    const pass = !error && deepEqual(actual, test.expected_output);
    results.push({ input: test.input, expected: test.expected_output, actual, pass, error });
  }

  return { testsPassed: results.filter((r) => r.pass).length, testsTotal: results.length, results };
}

async function executeWithTimeout(exec: () => unknown, timeoutMs: number): Promise<unknown> {
  const result = exec();
  if (isPromiseLike(result)) {
    return Promise.race([
      result,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timed out")), timeoutMs)
      ),
    ]);
  }
  return result;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as PromiseLike<unknown>).then === "function"
  );
}

/**
 * The DB stores the input as an array of arguments, e.g.:
 * - ["Hello World"]          -> fn("Hello World")        (1 arg = string)
 * - [[1,1,2]]                -> fn([1,1,2])              (1 arg = array)
 * - [[2,7,11,15], 9]         -> fn([2,7,11,15], 9)       (2 args)
 *
 * We pass the input array directly as the args (deep-cloned so the user's
 * code cannot mutate the original test case data).
 */
function buildArgs(_arity: number, input: unknown[]): unknown[] {
  return JSON.parse(JSON.stringify(input));
}

/* ------------------------------------------------------------------ */
/* Deep equality                                                       */
/* ------------------------------------------------------------------ */

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a as object);
    const kb = Object.keys(b as object);
    if (ka.length !== kb.length) return false;
    return ka.every((k) =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    );
  }
  return false;
}
