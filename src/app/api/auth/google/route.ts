import { NextResponse } from "next/server";
import { buildGoogleAuthUrl, getGoogleRedirectUri, isGoogleOAuthConfigured } from "@/lib/auth/google";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=google_unavailable`);
  }

  // CSRF protection: random state echoed back by Google, verified in callback.
  const state = crypto.randomUUID();

  const redirectUri = getGoogleRedirectUri(origin);
  const response = NextResponse.redirect(buildGoogleAuthUrl(redirectUri, state));

  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
