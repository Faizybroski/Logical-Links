import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Session hint cookie ───────────────────────────────────────────────────────
// Set by the client-side auth store (auth.store.ts) on login/rehydration.
// Value is the user's role ("admin" | "shipper"). Contains no token data.
// Used only as a fast routing hint — real token validation happens client-side.
const SESSION_COOKIE = "ll-session";

// Routes that require authentication — redirect to /login if no session cookie.
const PROTECTED_PREFIXES = ["/admin", "/shipper", "/driver"];

// Routes that authenticated users should not reach — redirect to their dashboard.
const AUTH_ONLY_PATHS = new Set(["/", "/login", "/register", "/forgot-password"]);

function getDashboard(role: string | undefined): string {
  if (role === "admin")   return "/admin/dashboard";
  if (role === "shipper") return "/shipper/dashboard";
  return "/admin/dashboard"; // safe fallback
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  const role = sessionCookie?.value;
  const hasSession = Boolean(role);

  // ── 1. Unauthenticated users hitting a protected route ──────────────────────
  if (!hasSession && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    console.info(`[Auth][Middleware] No session — redirecting ${pathname} → /login`);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Authenticated users hitting public/auth-only routes ──────────────────
  if (hasSession && AUTH_ONLY_PATHS.has(pathname)) {
    const dest = getDashboard(role);
    console.info(`[Auth][Middleware] Session present — redirecting ${pathname} → ${dest}`);
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals, static files, and API routes
  // that need to run unconditionally (auth callback, etc.)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf|eot)).*)",
  ],
};
