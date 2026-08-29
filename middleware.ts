import { NextResponse, type NextRequest } from "next/server";

// Optimistic presence check only, running on the Edge runtime, which
// has no node:crypto and so cannot verify the HMAC signature on the
// session cookie (see src/lib/auth/session.ts). Real verification
// happens in getSession()/requireSession(), called from Server
// Components, Server Actions and Route Handlers, all of which run on
// the Node runtime. This file exists purely to redirect a signed-out
// visitor to /login before a protected page renders; it must never
// become the actual security boundary.
export function middleware(req: NextRequest) {
  const hasCookie = Boolean(req.cookies.get("adhikaar_session"));
  if (!hasCookie) {
    // pathname + search, not just pathname: a signed-out visitor who
    // reached here via /start?problem=... (the Rights Navigator's
    // "Get the record you will need" handoff) must land back on that
    // exact pre-seeded URL after signing in, not a blank /start.
    const returnTo = req.nextUrl.pathname + req.nextUrl.search;
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", returnTo);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/my/:path*", "/start/:path*"],
};
