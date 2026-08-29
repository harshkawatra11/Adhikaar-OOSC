// Exchanges a Firebase ID token (obtained client-side via
// firebaseClient.ts after a successful sign-in) for this app's own
// signed session cookie. See src/lib/auth/session.ts for why this
// exists instead of admin.auth().createSessionCookie().

import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/auth/adminAuth";
import { encodeSession, newSessionExpiry, sessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: Request) {
  let idToken: string;
  try {
    const body = await req.json();
    idToken = String(body.idToken ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request body." }, { status: 400 });
  }

  if (!idToken) {
    return NextResponse.json({ ok: false, error: "idToken is required." }, { status: 400 });
  }

  try {
    const identity = await verifyIdToken(idToken);
    const cookieValue = encodeSession({
      uid: identity.uid,
      email: identity.email,
      name: identity.name || identity.email,
      exp: newSessionExpiry(),
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, cookieValue, sessionCookieOptions());
    return res;
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Sign-in verification failed." },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
