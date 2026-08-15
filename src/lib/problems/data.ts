import { createClient } from "@/lib/supabase/server";

export interface Problem {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  constraints: string | null;
  starter_code: string;
  function_name: string;
}

export interface TestCase {
  id: string;
  input: unknown[];
  expected_output: unknown;
  is_sample: boolean;
}

export async function listProblems(): Promise<Problem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select("*")
    .order("difficulty", { ascending: true });
  return (data ?? []) as Problem[];
}

export async function getProblem(id: string): Promise<Problem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Problem) ?? null;
}

export async function getProblemBySlug(slug: string): Promise<Problem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select("*")
    .eq("slug", slug)
    .single();
  return (data as Problem) ?? null;
}

export async function getTestCases(problemId: string): Promise<TestCase[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("problem_test_cases")
    .select("*")
    .eq("problem_id", problemId)
    .order("sort_order", { ascending: true });
  return (data ?? []) as TestCase[];
}
