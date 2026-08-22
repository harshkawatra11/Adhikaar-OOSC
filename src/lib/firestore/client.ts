// Firestore Admin client, the production persistence path this product
// has argued for from the start: org-scoped, shared across serverless
// instances, unlike the /tmp fallback in fileStore.ts. Configured with a
// service account scoped to exactly one IAM role, roles/datastore.user,
// on a dedicated GCP project. That account cannot touch billing, cannot
// create resources, cannot read anything outside this Firestore
// database.
//
// Cost containment for this project is layered, not a single promise:
// the Firestore database was provisioned on the perpetual free tier
// (50,000 reads, 20,000 writes and 20,000 deletes a day, 1 GiB storage,
// not a trial credit that expires), a GCP billing budget alert fires at
// 1 cent, 50 cents and one dollar spent, and src/lib/firestore/rateLimit.ts
// throttles writes in-process as a backstop against a runaway loop. None
// of that is a substitute for the others; together they mean ordinary
// hackathon-demo traffic never approaches a billable threshold, and if
// something unexpected did, the budget alert reaches a human quickly.

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export function isFirestoreConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

let app: App | null = null;
let db: Firestore | null = null;

export function getFirestoreDb(): Firestore {
  if (!isFirestoreConfigured()) {
    throw new Error(
      "Firestore is not configured (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Falling back to the local file store."
    );
  }
  if (!db) {
    if (!getApps().length) {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Vercel env vars store newlines as the two-character escape;
          // real Firestore private keys need them as actual line breaks.
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      app = getApps()[0]!;
    }
    db = getFirestore(app);
  }
  return db;
}
