import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection (Next.js 16 "proxy" convention, formerly middleware).
 * Unauthenticated users hitting any dashboard route are redirected to /login.
 * The auth cookie (lms_token) is HTTP-only, but the proxy runs server-side and
 * can read it. This is a UX guard; the backend API remains the authoritative
 * auth gate (it rejects requests without a valid cookie with 401).
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get("lms_token");
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except: the login page, API/RSC data, static assets,
    // and the public SVGs in /public.
    "/((?!login|api|_next/static|_next/image|_next/data|favicon\\.ico|file\\.svg|globe\\.svg|next\\.svg|vercel\\.svg|window\\.svg).*)",
  ],
};
