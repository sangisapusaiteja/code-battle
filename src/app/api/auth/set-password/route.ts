import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/**
 * Password management for the profile page.
 * GET  → identity + hasPassword (Google accounts may have none).
 * POST → { newPassword }                     creates a password (when none exists)
 *        { currentPassword, newPassword }    changes an existing password.
 */

interface UserRow {
  username: string;
  google_id: string | null;
  avatar_url: string | null;
}

async function loadUser(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("username, google_id, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  return data as UserRow | null;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const user = await loadUser(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const supabase = await createClient();
  const { data: hashData } = await supabase.rpc("get_password_hash", {
    p_username: user.username,
  });

  return NextResponse.json({
    username: user.username,
    avatarUrl: user.avatar_url ?? null,
    isGoogleUser: Boolean(user.google_id),
    hasPassword: Boolean(hashData),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };

  try {
    body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const newPassword = String(body.newPassword ?? "");
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const user = await loadUser(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const supabase = await createClient();
  const { data: hashData } = await supabase.rpc("get_password_hash", {
    p_username: user.username,
  });
  const storedHash = hashData as string | null;

  if (!storedHash) {
    // CREATE — Google account without a password yet. No current needed.
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        auth_provider: "password",
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, mode: "created" });
  }

  // CHANGE — verify the existing password first.
  const currentPassword = String(body.currentPassword ?? "");
  if (!currentPassword) {
    return NextResponse.json(
      { error: "Enter your current password." },
      { status: 400 }
    );
  }

  const valid = await bcrypt.compare(currentPassword, storedHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Your current password is incorrect." },
      { status: 401 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const { error } = await supabase
    .from("users")
    .update({
      password_hash: passwordHash,
      auth_provider: "password",
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, mode: "changed" });
}
