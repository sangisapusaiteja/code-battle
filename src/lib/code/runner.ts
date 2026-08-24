import type { TestRunResult } from "@/types";
import type { TestCase } from "@/lib/problems/client-data";

// Linked-list problems: the runner must convert array inputs into ListNode
// nodes and back. This set drives the conversion. The value -1 is used as a
// sentinel for an expected `null` result, because the DB column is NOT NULL.
const LIST_PROBLEMS = new Set([
  "intersection-of-two-linked-lists",
  "remove-nth-node-from-end-of-list",
  "remove-duplicates-from-sorted-list-ii",
  "swap-nodes-in-pairs",
  "partition-list",
  "rotate-list",
  "add-two-numbers",
  "copy-list-with-random-pointer",
  "palindrome-linked-list",
  "reverse-linked-list",
  "reverse-linked-list-ii",
  "reverse-nodes-in-k-group",
  "middle-of-the-linked-list",
  "linked-list-cycle-ii",
]);

/**
 * Runs a user's JavaScript solution against a set of test cases.
 * Executes via `new Function` in an isolated scope.
 * Supports plain functions, class methods (ClassName.methodName), and
 * linked-list problems (arrays <-> ListNode conversion).
 */
export async function runSolution(
  source: string,
  functionName: string,
  testCases: TestCase[],
  timeoutMs = 5000,
  problemSlug?: string
): Promise<TestRunResult> {
  const results: TestRunResult["results"] = [];
  const isListProblem = problemSlug ? LIST_PROBLEMS.has(problemSlug) : false;

  const methodSeparator = functionName.indexOf(".");
  const isMethod = methodSeparator !== -1;
  const constructorName = isMethod ? functionName.slice(0, methodSeparator) : functionName;
  const methodName = isMethod ? functionName.slice(methodSeparator + 1) : null;

  let fn: ((...args: unknown[]) => unknown) | null = null;
  try {
    // Inject a ListNode constructor so solutions can call `new ListNode(val, next)`
    // even when converting arrays to plain {val, next} objects.
    const listNodePreamble = isListProblem
      ? `class ListNode { constructor(val, next = null) { this.val = val; this.next = next; } }
         class _Node { constructor(val) { this.val = val; this.next = null; this.random = null; } }`
      : "";
    const runner = new Function(
      `"use strict";\n${listNodePreamble}\n${source}\nreturn (typeof ${constructorName} === "function") ? ${constructorName} : null;`
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
      error: `Constructor "${constructorName}" was not found.`,
    };
  }

  const arity = fn.length;

  for (const test of testCases) {
    let actual: unknown;
    let error: string | undefined;
    try {
      let args = buildArgs(arity, test.input);
      const firstArg = args[0];

      if (isListProblem) {
        // Convert array args into ListNode nodes, run, then convert back.
        let raw: unknown;
        if (problemSlug === "copy-list-with-random-pointer") {
          // Input is a list of [val, randomIndex] pairs, e.g. [[7,null],[13,0],...]
          const pairs = (firstArg as unknown[]) ?? [];
          const head = randomToNode(pairs);
          raw = await executeWithTimeout(() => fn?.(head), timeoutMs);
          actual = randomToArray(raw);
        } else if (problemSlug === "linked-list-cycle-ii") {
          // Input is [head_array, pos]; pos is the index the tail connects to,
          // or -1 for no cycle.
          const arr = args[0] as unknown[];
          const pos = args[1] as number;
          const head = arrayToNode(arr);
          if (pos >= 0) {
            const nodes: { next: unknown }[] = [];
            let cur = head as { next: unknown } | null;
            while (cur) { nodes.push(cur); cur = cur.next as { next: unknown } | null; }
            if (nodes.length > 0) nodes[nodes.length - 1].next = nodes[pos];
          }
          raw = await executeWithTimeout(() => fn?.(head), timeoutMs);
          actual = raw === null || raw === undefined ? -1 : (raw as { val: unknown }).val;
        } else {
          args = args.map((a) => arrayToNode(a));
          if (isMethod) {
            const rest = args.slice(1);
            const instance = new (fn as unknown as new (...a: unknown[]) => Record<string, unknown>)(
              ...args
            );
            const method = instance[methodName as string] as (...a: unknown[]) => unknown;
            raw = await executeWithTimeout(() => method.apply(instance, rest), timeoutMs);
          } else {
            raw = await executeWithTimeout(() => fn?.(...args), timeoutMs);
          }
          // Intersection / cycle-start return a single node (its value), not a list.
          if (
            problemSlug === "intersection-of-two-linked-lists" ||
            problemSlug === "linked-list-cycle-ii"
          ) {
            actual = raw === null || raw === undefined ? -1 : (raw as { val: unknown }).val;
          } else if (problemSlug === "palindrome-linked-list") {
            // Palindrome returns a boolean, not a list — no conversion.
            actual = raw;
          } else {
            actual = nodeToArray(raw);
          }
        }
      } else if (isMethod) {
        const rest = args.slice(1);
        const instance = new (fn as unknown as new (...a: unknown[]) => Record<string, unknown>)(
          ...args
        );
        const method = instance[methodName as string] as (...a: unknown[]) => unknown;
        actual = await executeWithTimeout(() => method.apply(instance, rest), timeoutMs);
      } else {
        actual = await executeWithTimeout(() => fn?.(...args), timeoutMs);
        if (actual === undefined && Array.isArray(firstArg)) {
          actual = firstArg;
        }
      }
    } catch (e) {
      error = (e as Error).message;
    }

    // Linked-list problems: expected `null` (empty list or no intersection)
    // is stored as -1 because the DB column is NOT NULL. Copy-list returns an
    // array of pairs, so it is excluded from this normalization.
    let expected: unknown = test.expected_output;
    if (
      isListProblem &&
      problemSlug !== "intersection-of-two-linked-lists" &&
      problemSlug !== "linked-list-cycle-ii" &&
      problemSlug !== "copy-list-with-random-pointer"
    ) {
      if (test.expected_output === -1 || (Array.isArray(test.expected_output) && test.expected_output.length === 0)) {
        expected = null;
      }
    }
    const pass = !error && deepEqual(actual, expected);
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
 * Convert an array of node values into a linked list of ListNode objects.
 * If the arg is already an object with a `.next`/`.val`, it is returned as-is.
 */
export function arrayToNode(value: unknown): unknown {
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const head = { val: value[0], next: null as unknown };
    let cur = head;
    for (let i = 1; i < value.length; i++) {
      cur.next = { val: value[i], next: null as unknown };
      cur = cur.next as { val: unknown; next: unknown };
    }
    return head;
  }
  return value;
}

/** Convert a ListNode (or null) back into an array of node values. */
export function nodeToArray(node: unknown): unknown {
  if (node === null || node === undefined) return null;
  const out: unknown[] = [];
  let cur = node as { val: unknown; next: unknown } | null;
  const seen = new Set<unknown>();
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    out.push(cur.val);
    cur = cur.next as { val: unknown; next: unknown } | null;
  }
  return out;
}

/**
 * Convert a list of [val, randomIndex] pairs into a linked list with
 * `random` pointers, e.g. [[7,null],[13,0],[11,4]].
 */
export function randomToNode(pairs: unknown[]): unknown {
  if (!pairs || pairs.length === 0) return null;
  const nodes = pairs.map(() => ({ val: null as unknown, next: null as unknown, random: null as unknown }));
  pairs.forEach((pair, i) => {
    const [val, randomIdx] = pair as [unknown, number | null];
    nodes[i].val = val;
    if (i + 1 < nodes.length) nodes[i].next = nodes[i + 1];
    if (randomIdx !== null && randomIdx !== undefined) {
      nodes[i].random = nodes[randomIdx as number];
    }
  });
  return nodes[0];
}

/** Convert a copied random-pointer list back into [[val, randomIndex], ...]. */
export function randomToArray(node: unknown): unknown {
  if (node === null || node === undefined) return [];
  const out: [unknown, number | null][] = [];
  const indexMap = new Map<unknown, number>();
  let cur = node as { val: unknown; next: unknown; random: unknown } | null;
  const nodes: { random: unknown }[] = [];
  const seen = new Set<unknown>();
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    indexMap.set(cur, nodes.length);
    nodes.push(cur);
    out.push([cur.val, null]);
    cur = cur.next as { val: unknown; next: unknown; random: unknown } | null;
  }
  nodes.forEach((n, i) => {
    out[i][1] = n.random === null || n.random === undefined ? null : indexMap.get(n.random) ?? null;
  });
  return out;
}

/**
 * The DB stores the input as an array of arguments, e.g.:
 * - ["Hello World"]          -> fn("Hello World")        (1 arg = string)
 * - [[1,1,2]]                -> fn([1,1,2])              (1 arg = array)
 * - [[2,7,11,15], 9]         -> fn([2,7,11,15], 9)       (2 args)
 */
function buildArgs(_arity: number, input: unknown[]): unknown[] {
  // Some problems store a single scalar/string input directly (e.g. "()"),
  // not wrapped in an array. Normalize to an array of args.
  if (!Array.isArray(input)) {
    return [input];
  }
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
