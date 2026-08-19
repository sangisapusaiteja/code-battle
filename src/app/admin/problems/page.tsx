"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, ArrowLeft, CheckCircle2, Code, FileText } from "lucide-react";
import Link from "next/link";

type TestCaseDraft = {
  input: string;
  expected_output: string;
  is_sample: boolean;
};

const inputCls =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500 placeholder:text-neutral-600";

const EXAMPLE_JSON = `{
  "slug": "two-sum",
  "title": "Two Sum",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  "difficulty": "easy",
  "category": "Hash Maps",
  "constraints": "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9",
  "starter_code": "function twoSum(nums, target) {\\n  //\\n}",
  "function_name": "twoSum",
  "test_cases": [
    { "input": [[2,7,11,15],9], "expected_output": [0,1], "is_sample": true },
    { "input": [[3,2,4],6], "expected_output": [1,2], "is_sample": true }
  ]
}`;

type Mode = "form" | "json";

export default function AdminProblemsPage() {
  const [form, setForm] = useState({
    slug: "",
    title: "",
    description: "",
    difficulty: "easy",
    category: "",
    constraints: "",
    starter_code: "",
    function_name: "",
  });
  const [testCases, setTestCases] = useState<TestCaseDraft[]>([
    { input: "", expected_output: "", is_sample: true },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState<Mode>("form");
  const [jsonText, setJsonText] = useState(EXAMPLE_JSON);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const updateTestCase = (index: number, key: keyof TestCaseDraft, value: string | boolean) => {
    setTestCases((prev) =>
      prev.map((tc, i) => (i === index ? { ...tc, [key]: value } : tc))
    );
    setSuccess(false);
  };

  const addTestCase = () => {
    setTestCases((prev) => [...prev, { input: "", expected_output: "", is_sample: false }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const buildJsonPayload = () => {
    const parsed = [];
    for (const tc of testCases) {
      if (!tc.input.trim() && !tc.expected_output.trim()) continue;
      try {
        parsed.push({
          input: JSON.parse(tc.input),
          expected_output: JSON.parse(tc.expected_output),
          is_sample: tc.is_sample,
        });
      } catch {
        return null;
      }
    }
    if (parsed.length === 0) return null;
    return JSON.stringify({ ...form, test_cases: parsed }, null, 2);
  };

  const applyJsonToForm = (text: string): boolean => {
    try {
      const data = JSON.parse(text);
      setForm({
        slug: data.slug ?? "",
        title: data.title ?? "",
        description: data.description ?? "",
        difficulty: data.difficulty ?? "easy",
        category: data.category ?? "",
        constraints: data.constraints ?? "",
        starter_code: data.starter_code ?? "",
        function_name: data.function_name ?? "",
      });
      if (Array.isArray(data.test_cases)) {
        setTestCases(
          data.test_cases.map((tc: Record<string, unknown>) => ({
            input: typeof tc.input === "string" ? tc.input : JSON.stringify(tc.input ?? ""),
            expected_output: typeof tc.expected_output === "string" ? tc.expected_output : JSON.stringify(tc.expected_output ?? ""),
            is_sample: Boolean(tc.is_sample),
          }))
        );
      }
      setJsonError(null);
      return true;
    } catch {
      setJsonError("Invalid JSON.");
      return false;
    }
  };

  const switchToForm = () => {
    if (applyJsonToForm(jsonText)) {
      setMode("form");
    }
  };

  const switchToJson = () => {
    const payload = buildJsonPayload();
    if (payload) setJsonText(payload);
    setMode("json");
    setJsonError(null);
  };

  const toggleMode = () => (mode === "form" ? switchToJson() : switchToForm());

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    let payloadToSend: string;
    if (mode === "json") {
      payloadToSend = jsonText;
      try {
        JSON.parse(payloadToSend);
      } catch {
        setError("Invalid JSON.");
        setSaving(false);
        return;
      }
    } else {
      const parsed = [];
      for (const tc of testCases) {
        if (!tc.input.trim() && !tc.expected_output.trim()) continue;
        try {
          parsed.push({
            input: JSON.parse(tc.input),
            expected_output: JSON.parse(tc.expected_output),
            is_sample: tc.is_sample,
          });
        } catch {
          setError("Test case input/output must be valid JSON.");
          setSaving(false);
          return;
        }
      }
      payloadToSend = JSON.stringify({ ...form, test_cases: parsed });
    }

    try {
      const res = await fetch("/api/admin/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadToSend,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to create problem.");
      }
      setSuccess(true);
      setForm({
        slug: "",
        title: "",
        description: "",
        difficulty: "easy",
        category: "",
        constraints: "",
        starter_code: "",
        function_name: "",
      });
      setTestCases([{ input: "", expected_output: "", is_sample: true }]);
      setJsonText(EXAMPLE_JSON);
      setMode("form");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create problem.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-emerald-500/10 bg-black/80 backdrop-blur-sm px-4 sm:px-6 py-3 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-emerald-400 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <span className="text-sm font-bold text-emerald-400">Admin · Add Problem</span>
        <button
          onClick={toggleMode}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10"
          title={mode === "form" ? "Switch to JSON" : "Switch to Form"}
        >
          {mode === "form" ? <Code className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
          <span className="text-xs font-semibold">{mode === "form" ? "JSON" : "Form"}</span>
        </button>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-extrabold text-neutral-100">Add Problem</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Create a new coding problem and its test cases.
        </p>

        {error ? (
          <div className="mt-4 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#ef4444]">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Problem created successfully!
          </div>
        ) : null}

        {mode === "form" ? (
          <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-500">Problem Details</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-400">Slug *</span>
                  <input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="two-sum" className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-400">Title *</span>
                  <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Two Sum" className={inputCls} />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-400">Description *</span>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="Given an array of integers..." className={inputCls} />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-400">Difficulty *</span>
                  <select value={form.difficulty} onChange={(e) => update("difficulty", e.target.value)} className={inputCls}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-400">Category *</span>
                  <input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Hash Maps" className={inputCls} />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-400">Constraints</span>
                <textarea value={form.constraints} onChange={(e) => update("constraints", e.target.value)} rows={2} placeholder="2 <= nums.length <= 10^4" className={inputCls} />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-400">Starter Code *</span>
                <textarea value={form.starter_code} onChange={(e) => update("starter_code", e.target.value)} rows={4} placeholder="function twoSum(nums, target) { ... }" className={`${inputCls} font-mono text-xs`} />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-400">Function Name *</span>
                <input value={form.function_name} onChange={(e) => update("function_name", e.target.value)} placeholder="twoSum" className={inputCls} />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Test Cases</h2>
              <button onClick={addTestCase} className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/10">
                <Plus className="h-3.5 w-3.5" /> Add Test Case
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {testCases.map((tc, index) => (
                <div key={index} className="rounded-lg border border-neutral-800 bg-black p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500">Test Case {index + 1}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <input
                          type="checkbox"
                          checked={tc.is_sample}
                          onChange={(e) => updateTestCase(index, "is_sample", e.target.checked)}
                          className="accent-emerald-500"
                        />
                        Sample
                      </label>
                      {testCases.length > 1 && (
                        <button onClick={() => removeTestCase(index)} className="text-neutral-500 hover:text-[#ef4444] transition-colors" aria-label="Remove test case">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-neutral-500">Input (JSON)</span>
                      <textarea value={tc.input} onChange={(e) => updateTestCase(index, "input", e.target.value)} rows={2} placeholder='[[2,7,11,15],9]' className={`${inputCls} font-mono text-xs`} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-neutral-500">Expected Output (JSON)</span>
                      <textarea value={tc.expected_output} onChange={(e) => updateTestCase(index, "expected_output", e.target.value)} rows={2} placeholder='[0,1]' className={`${inputCls} font-mono text-xs`} />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-8 py-3.5 text-base font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                Create Problem
              </button>
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-500">JSON Payload</h2>
            <p className="mb-3 text-xs text-neutral-400">Edit the JSON directly. Switch to Form to apply.</p>
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setJsonError(null);
              }}
              rows={20}
              placeholder={EXAMPLE_JSON}
              className={`${inputCls} font-mono text-xs`}
            />
            {jsonError ? (
              <p className="mt-2 text-xs text-[#ef4444]">{jsonError}</p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                onClick={switchToForm}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10"
              >
                <FileText className="h-3.5 w-3.5" /> Apply & Switch to Form
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Problem
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}