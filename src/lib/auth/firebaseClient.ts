// The Firebase client SDK singleton, browser-side only. This is a
// different credential surface from src/lib/firestore/client.ts, which
// is the server-side admin SDK scoped to roles/datastore.user. This
// file only ever talks to Firebase Authentication, never Firestore: the
// browser never reads or writes a case directly, every read and write
// goes through a Server Action or a route handler using the admin SDK.
//
// The four NEXT_PUBLIC_FIREBASE_* values below are public client
// identifiers, not secrets. Firebase's own security boundary for a
// web app is Firestore rules and the admin SDK, not the API key; this
// app additionally never exposes Firestore to the client at all, so
// even a copied API key cannot be used to read another citizen's case.

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

/** Throws if the four NEXT_PUBLIC_FIREBASE_* variables are not set.
 *  Callers (LoginForm, SignOutButton) check isFirebaseClientConfigured()
 *  first and show a clear message instead of calling this. */
export function getFirebaseAuth(): Auth {
  if (!isFirebaseClientConfigured()) {
    throw new Error(
      "Firebase client config is not set (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID)."
    );
  }
  if (!auth) {
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
  return auth;
}
