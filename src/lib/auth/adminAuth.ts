// Server-side ID token verification, the one Firebase Auth admin call
// this app makes. admin.auth().verifyIdToken() works under the
// project's roles/datastore.user service account because it verifies a
// JWT signature against Google's public certificates rather than
// calling a project-scoped admin API. Two calls that would NOT work
// under that same restricted role, and that this file deliberately
// never makes: admin.auth().createSessionCookie() (needs
// iam.serviceAccounts.signBlob) and admin.auth().getUserByEmail() /
// listUsers() (needs a Firebase Auth admin role, since they hit the
// Identity Toolkit API). See src/lib/auth/session.ts for what this
// feeds into, and .env.example's DEMO_UID comment for why the demo
// account's uid is a hardcoded environment variable rather than looked
// up by email at runtime.

import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdminApp } from "@/lib/firestore/client";

export interface VerifiedIdentity {
  uid: string;
  email: string;
  name: string;
}

/** Throws if the token is invalid, expired, or the admin credentials
 *  are not configured. Never called with { checkRevoked: true }: that
 *  option calls Identity Toolkit and would fail the same permission
 *  check createSessionCookie does. */
export async function verifyIdToken(idToken: string): Promise<VerifiedIdentity> {
  const decoded = await getAuth(getFirebaseAdminApp()).verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    email: typeof decoded.email === "string" ? decoded.email : "",
    name: typeof decoded.name === "string" ? decoded.name : "",
  };
}
