// This app's own session cookie, signed with an HMAC secret this app
// controls, deliberately NOT a Firebase session cookie minted with
// admin.auth().createSessionCookie(). That call needs
// iam.serviceAccounts.signBlob, which the service account behind this
// project does not have and should not be granted: it is scoped to
// exactly roles/datastore.user, a documented, deliberate choice (see
// src/lib/firestore/client.ts). Widening it to make a login button
// work would undo that choice for a feature that does not need it.
//
// The flow: the client signs in with the Firebase web SDK
// (firebaseClient.ts), gets an ID token, and POSTs it to
// /api/auth/session. That route calls admin.auth().verifyIdToken(),
// which DOES work under roles/datastore.user because it verifies a JWT
// against Google's public signing certificates rather than calling a
// project-scoped admin API, and never with checkRevoked: true, which
// would call Identity Toolkit and fail the same way createSessionCookie
// does. This module then signs a small payload of our own.
//
// This module must run only on the Node runtime (Server Components,
// Server Actions, Route Handlers), never in middleware.ts, which runs
// on the Edge runtime by default and has no node:crypto. middleware.ts
// only checks whether the cookie is present, as a redirect convenience;
// this module is the actual security boundary.

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE_NAME = "adhikaar_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // fourteen days

export interface Session {
  uid: string;
  email: string;
  name: string;
  exp: number; // unix seconds
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Generate one with `openssl rand -hex 32` and add it to .env.local (see .env.example)."
    );
  }
  return secret;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function encodeSession(session: Session): string {
  const payload = base64url(JSON.stringify(session));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

/** Never throws. Returns null on any malformed, unsigned, or expired
 *  cookie, so a tampered or stale cookie behaves exactly like no
 *  cookie at all rather than producing a 500. */
export function decodeSession(raw: string): Session | null {
  const parts = raw.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;

  const expectedSignature = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  // timingSafeEqual throws on a length mismatch rather than returning
  // false, so that case is checked explicitly first.
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let session: Session;
  try {
    session = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  } catch {
    return null;
  }

  if (typeof session.uid !== "string" || typeof session.exp !== "number") return null;
  if (session.exp < Math.floor(Date.now() / 1000)) return null;

  return session;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

/** For Server Components and Server Actions. Redirects to /login,
 *  preserving the current path in ?next=, when there is no valid
 *  session. Every Server Action that touches a citizen's own case
 *  calls this first and passes the resulting uid into the store. */
export async function requireSession(currentPath?: string): Promise<Session> {
  const session = await getSession();
  if (!session) {
    const target = currentPath ? `/login?next=${encodeURIComponent(currentPath)}` : "/login";
    redirect(target);
  }
  return session;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export function newSessionExpiry(): number {
  return Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
}
