import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";

const SESSION_COOKIE = "cb_session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const path = request.nextUrl.pathname;
  const authed = Boolean(session);

  if (authed && (path.startsWith("/login") || path.startsWith("/signup"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!authed && (path.startsWith("/dashboard") || path.startsWith("/battle"))) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
