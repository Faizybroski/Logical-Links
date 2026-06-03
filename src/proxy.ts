import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SESSION_COOKIE = "ll-session";

const PROTECTED_PREFIXES = ["/admin", "/shipper", "/driver"];

const AUTH_ONLY_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
]);

/**
 * Proxy (Next.js 16 replacement for middleware).
 *
 * Responsibility: refresh the Supabase session cookie on every request.
 * Route protection is handled by layout.tsx files (Server Components),
 * not here — doing DB queries per-request in the proxy is too expensive.
 */

function getDashboard(role: string | undefined): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "shipper") return "/shipper/dashboard";
  return "/admin/dashboard";
}

// export async function proxy(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   const sessionCookie = request.cookies.get(SESSION_COOKIE);
//   const role = sessionCookie?.value;
//   const hasSession = Boolean(role);

//   // Unauthenticated user trying protected routes
//   if (
//     !hasSession &&
//     PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
//   ) {
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("redirect", pathname);

//     return NextResponse.redirect(loginUrl);
//   }

//   // Authenticated user trying login/register pages
//   if (hasSession && AUTH_ONLY_PATHS.has(pathname)) {
//     return NextResponse.redirect(
//       new URL(getDashboard(role), request.url)
//     );
//   }

//   return NextResponse.next();
// }


export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

   const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  const role = sessionCookie?.value;
  const hasSession = Boolean(role);

  // Unauthenticated user trying protected routes
  if (
    !hasSession &&
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying login/register pages
  if (hasSession && AUTH_ONLY_PATHS.has(pathname)) {
    return NextResponse.redirect(
      new URL(getDashboard(role), request.url)
    );
  }

  return NextResponse.next();
  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   {
  //     cookies: {
  //       getAll() {
  //         return request.cookies.getAll()
  //       },
  //       setAll(cookiesToSet) {
  //         cookiesToSet.forEach(({ name, value }) =>
  //           request.cookies.set(name, value)
  //         )
  //         response = NextResponse.next({ request })
  //         cookiesToSet.forEach(({ name, value, options }) =>
  //           response.cookies.set(name, value, options)
  //         )
  //       },
  //     },
  //   }
  // )

  // // Required: refreshes the session so Server Components get a valid user.
  // // Do NOT use getSession() here — getUser() validates the JWT server-side.
  // await supabase.auth.getUser()

  // return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
