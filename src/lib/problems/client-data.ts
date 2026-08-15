import { createClient } from "@/lib/supabase/client";

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

export async function listProblemsClient(): Promise<Problem[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("problems")
    .select("*")
    .order("difficulty", { ascending: true });
  return (data ?? []) as Problem[];
}

export async function getProblemClient(id: string): Promise<Problem | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("problems")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Problem) ?? null;
}

export async function getProblemBySlugClient(slug: string): Promise<Problem | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("problems")
    .select("*")
    .eq("slug", slug)
    .single();
  return (data as Problem) ?? null;
}

export interface TestCase {
  id: string;
  input: unknown[];
  expected_output: unknown;
  is_sample: boolean;
}

export async function getTestCasesClient(problemId: string): Promise<TestCase[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("problem_test_cases")
    .select("*")
    .eq("problem_id", problemId)
    .order("sort_order", { ascending: true });
  return (data ?? []) as TestCase[];
}
