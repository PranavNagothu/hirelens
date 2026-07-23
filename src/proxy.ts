// Proxy — Next 16's renamed Middleware. Runs before a request completes.
//
// Per the Next 16 docs, Proxy is for OPTIMISTIC checks only, not real authorization: it merely
// checks whether a session cookie is PRESENT and redirects accordingly, to keep signed-out users off
// app pages and signed-in users off the login page. It never verifies the token or touches the
// database. The authoritative check (verify the JWT, load the user, enforce ownership) happens in the
// server components and route handlers — see src/lib/auth. A forged cookie gets past this redirect
// and is then rejected by the real check, so this is a UX convenience, never the security boundary.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

const PROTECTED_PREFIXES = ["/dashboard", "/jobs", "/applications", "/apply"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Run on everything except Next internals, static assets, and the auth API (which must set the
// cookie without being redirected).
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
