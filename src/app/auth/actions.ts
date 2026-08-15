"use server";

import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export type AuthResult = { error: string } | undefined;

function normalizeUsername(username: string): string {
  return username
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}

export async function signUp(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const usernameRaw = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const username = normalizeUsername(usernameRaw);
  if (!username || !password) {
    return { error: "Username and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  // Check if username is taken.
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (existing) {
    return { error: "That username is already taken." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from("users")
    .insert({
      username,
      password_hash: passwordHash,
      elo: 1200,
      xp: 0,
      level: 1,
      wins: 0,
      losses: 0,
      current_streak: 0,
      best_streak: 0,
      problems_solved: 0,
      avg_solve_seconds: 0,
    })
    .select("id, username")
    .single();

  if (error || !user) {
    return { error: error?.message ?? "Failed to create account." };
  }

  await setSessionCookie({ userId: user.id, username: user.username });
  redirect("/dashboard");
}

export async function login(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const usernameRaw = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const username = normalizeUsername(usernameRaw);
  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, username")
    .eq("username", username)
    .maybeSingle();

  if (!user) {
    return { error: "Invalid username or password." };
  }

  // Fetch the hash via a SECURITY DEFINER function (not readable by anon).
  const { data: hashData } = await supabase.rpc("get_password_hash", {
    p_username: username,
  });
  const passwordHash = hashData as string | null;

  if (!passwordHash) {
    return { error: "Invalid username or password." };
  }

  const valid = await bcrypt.compare(password, passwordHash);
  if (!valid) {
    return { error: "Invalid username or password." };
  }

  await setSessionCookie({ userId: user.id, username: user.username });
  redirect("/dashboard");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
