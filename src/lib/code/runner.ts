import type { TestRunResult } from "@/types";
import type { TestCase } from "@/lib/problems/client-data";
import type { LanguageId } from "@/lib/code/languages";

/**
 * Runs a user's solution against a set of test cases.
 *
 * - JavaScript / TypeScript: executed natively via `new Function` in an
 *   isolated scope (no DOM, no localStorage, no network).
 * - Python: executed in-browser via Pyodide (WebAssembly). Pyodide is loaded
 *   lazily on first use.
 */
export async function runSolution(
  source: string,
  functionName: string,
  testCases: TestCase[],
  language: LanguageId = "javascript",
  timeoutMs = 5000
): Promise<TestRunResult> {
  if (language === "python") {
    return runPython(source, functionName, testCases, timeoutMs);
  }
  return runJs(source, functionName, testCases, timeoutMs);
}

/* ------------------------------------------------------------------ */
/* JavaScript / TypeScript                                             */
/* ------------------------------------------------------------------ */

async function runJs(
  source: string,
  functionName: string,
  testCases: TestCase[],
  timeoutMs: number
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
      actual = await executeWithTimeout(() => fn?.(...args), timeoutMs);
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

/* ------------------------------------------------------------------ */
/* Python (Pyodide)                                                    */
/* ------------------------------------------------------------------ */

let pyodidePromise: Promise<unknown> | null = null;

async function getPyodide(): Promise<unknown> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const { loadPyodide } = await import("pyodide");
      return loadPyodide();
    })();
  }
  return pyodidePromise;
}

interface PyodideLike {
  runPython(code: string): unknown;
  toPy(value: unknown): unknown;
  toJs(value: unknown): unknown;
  globals: {
    set(name: string, value: unknown): void;
  };
}

async function runPython(
  source: string,
  functionName: string,
  testCases: TestCase[],
  timeoutMs: number
): Promise<TestRunResult> {
  const results: TestRunResult["results"] = [];

  let py: PyodideLike;
  try {
    py = (await getPyodide()) as PyodideLike;
  } catch (e) {
    return {
      testsPassed: 0,
      testsTotal: testCases.length,
      results: [],
      error: `Failed to load Python runtime: ${(e as Error).message}`,
    };
  }

  // Define the user's function in the Python global namespace.
  try {
    py.runPython(source);
  } catch (e) {
    return {
      testsPassed: 0,
      testsTotal: testCases.length,
      results: [],
      error: `Syntax error: ${(e as Error).message}`,
    };
  }

  const hasFn = py.runPython(`callable(${functionName})`);
  if (!hasFn) {
    return {
      testsPassed: 0,
      testsTotal: testCases.length,
      results: [],
      error: `Function "${functionName}" was not found.`,
    };
  }

  const arity = py.toJs(py.runPython(`${functionName}.__code__.co_argcount`)) as number;

  for (const test of testCases) {
    let actual: unknown;
    let error: string | undefined;
    try {
      const args = buildArgs(arity, test.input);
      // Set each argument as a global, then call the function.
      args.forEach((v, i) => py.globals.set(`__arg${i}`, py.toPy(v)));
      const result = await Promise.race([
        Promise.resolve(
          py.runPython(
            `${functionName}(${args.map((_, i) => `__arg${i}`).join(", ")})`
          )
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timed out")), timeoutMs)
        ),
      ]);
      actual = py.toJs(result);
    } catch (e) {
      error = (e as Error).message;
    }
    const pass = !error && deepEqual(actual, test.expected_output);
    results.push({ input: test.input, expected: test.expected_output, actual, pass, error });
  }

  return { testsPassed: results.filter((r) => r.pass).length, testsTotal: results.length, results };
}

/**
 * Builds the argument list for a function call based on its arity.
 *
 * Handles two data shapes:
 * - Nested: input = [[2,7,11,15], 9]  -> fn([2,7,11,15], 9)   (arity 2)
 * - Flat:   input = ["h","e","l","l","o"] -> fn(["h","e","l","l","o"]) (arity 1)
 *
 * When the function takes a single argument and the stored input is a flat
 * array of scalars (first element is not itself an array/object), we wrap it
 * so the whole array is passed as one argument.
 */
function buildArgs(arity: number, input: unknown[]): unknown[] {
  if (arity === 1) {
    const first = input[0];
    const isNested = Array.isArray(first) || (first !== null && typeof first === "object");
    if (!isNested) {
      return [input];
    }
  }
  return input;
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
