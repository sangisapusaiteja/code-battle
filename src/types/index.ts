export interface TestRunResult {
  testsPassed: number;
  testsTotal: number;
  results: {
    input: unknown[];
    expected: unknown;
    actual: unknown;
    pass: boolean;
    error?: string;
  }[];
  error?: string;
}
