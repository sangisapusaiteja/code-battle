import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { setSessionCookie } from "@/lib/auth/session";
import { exchangeCodeForProfile, getGoogleRedirectUri, isGoogleOAuthConfigured } from "@/lib/auth/google";

const STATE_COOKIE = "google_oauth_state";

function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}

/** Derive a unique username from the Google profile's email/name. */
async function deriveUsername(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileEmail: string,
  profileName: string
): Promise<string> {
  const base =
    normalizeUsername(profileEmail.split("@")[0] || "") ||
    normalizeUsername(profileName) ||
    "player";

  let candidate = base;
  let suffix = 1;
  // Find a free username (bounded retries).
  for (let i = 0; i < 20; i++) {
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}${suffix++}`;
  }
  return `${base}${Date.now()}`;
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=google_unavailable`);
  }

  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const expectedState = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${STATE_COOKIE}=`))
    ?.split("=")[1];

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${origin}/login?error=google_failed`);
  }

  try {
    const profile = await exchangeCodeForProfile(code, getGoogleRedirectUri(origin));
    if (!profile.sub) {
      return NextResponse.redirect(`${origin}/login?error=google_failed`);
    }

    const supabase = await createClient();

    // Existing player? Just sign them in.
    const { data: existing } = await supabase
      .from("users")
      .select("id, username")
      .eq("google_id", profile.sub)
      .maybeSingle();

    if (existing) {
      await setSessionCookie({ userId: existing.id, username: existing.username });
      return NextResponse.redirect(origin + "/");
    }

    // First Google sign-in — create the shared user row.
    const username = await deriveUsername(
      supabase,
      profile.email ?? "",
      profile.name ?? ""
    );

    // Random unusable password — Google sign-in never checks it.
    const randomPassword = crypto.randomUUID() + crypto.randomUUID();
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        username,
        password_hash: passwordHash,
        google_id: profile.sub,
        avatar_url: profile.picture ?? null,
        auth_provider: "google",
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
      return NextResponse.redirect(`${origin}/login?error=google_failed`);
    }

    await setSessionCookie({ userId: user.id, username: user.username });
    return NextResponse.redirect(origin + "/");
  } catch {
    return NextResponse.redirect(`${origin}/login?error=google_failed`);
  }
}
