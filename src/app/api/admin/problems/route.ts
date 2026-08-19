import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

async function requireAdmin() {
  const session = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.userId)
    .single();

  if (!profile || profile.role !== "admin") {
    return { response: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }
  return { response: undefined };
}

type TestCaseInput = {
  input: unknown;
  expected_output: unknown;
  is_sample: boolean;
  sort_order: number;
};

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  let body: {
    slug?: string;
    title?: string;
    description?: string;
    difficulty?: string;
    category?: string;
    constraints?: string;
    starter_code?: string;
    function_name?: string;
    test_cases?: TestCaseInput[];
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const slug = body.slug?.trim();
  const title = body.title?.trim();
  const description = body.description?.trim();
  const difficulty = body.difficulty;
  const category = body.category?.trim();
  const starter_code = body.starter_code?.trim();
  const function_name = body.function_name?.trim();

  if (!slug || !title || !description || !difficulty || !category || !starter_code || !function_name) {
    return NextResponse.json(
      { error: "slug, title, description, difficulty, category, starter_code, and function_name are required." },
      { status: 400 }
    );
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return NextResponse.json({ error: "difficulty must be easy, medium, or hard." }, { status: 400 });
  }

  const supabase = await createClient();

  // Check slug uniqueness.
  const { data: existing } = await supabase
    .from("problems")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "A problem with that slug already exists." }, { status: 409 });
  }

  const { data: problem, error: problemError } = await supabase
    .from("problems")
    .insert({
      slug,
      title,
      description,
      difficulty,
      category,
      constraints: body.constraints?.trim() || null,
      starter_code,
      function_name,
    })
    .select("id")
    .single();

  if (problemError || !problem) {
    return NextResponse.json(
      { error: problemError?.message ?? "Failed to create problem." },
      { status: 500 }
    );
  }

  // Insert test cases if provided.
  if (body.test_cases && body.test_cases.length > 0) {
    const rows = body.test_cases.map((tc, i) => ({
      problem_id: problem.id,
      input: tc.input,
      expected_output: tc.expected_output,
      is_sample: Boolean(tc.is_sample),
      sort_order: tc.sort_order ?? i,
    }));

    const { error: tcError } = await supabase.from("problem_test_cases").insert(rows);
    if (tcError) {
      return NextResponse.json(
        { error: tcError.message ?? "Problem created but test cases failed." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true, problemId: problem.id });
}
