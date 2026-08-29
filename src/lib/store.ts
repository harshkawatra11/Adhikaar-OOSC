// The single import surface every route, action and page uses for case
// persistence. Everything else in this app imports from here and only
// from here, never from store/fileStore or store/firestoreStore
// directly, so the choice of backend lives in exactly one place.
//
// Firestore is used automatically when a service account is present in
// the environment (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL,
// FIREBASE_PRIVATE_KEY); otherwise the app falls back to the local file
// store with no setup required. This mirrors the same pattern the
// Gemini integration uses: a real backend when configured, a working
// product when it is not.
//
// Every function except createCase and listAllOpenCases takes an
// ownerUid, which the store implementation checks against the record
// before returning or mutating anything.

import { isFirestoreConfigured } from "@/lib/firestore/client";
import { firestoreStore } from "@/lib/store/firestoreStore";
import { fileStore } from "@/lib/store/fileStore";
import type { CaseStore } from "@/lib/store/types";

function getStore(): CaseStore {
  return isFirestoreConfigured() ? firestoreStore : fileStore;
}

export async function listCases(ownerUid: string) {
  return getStore().listCases(ownerUid);
}

export async function getCase(id: string, ownerUid: string) {
  return getStore().getCase(id, ownerUid);
}

export async function createCase(
  partial: Parameters<CaseStore["createCase"]>[0]
) {
  return getStore().createCase(partial);
}

export async function updateCase(
  id: string,
  ownerUid: string,
  patch: Parameters<CaseStore["updateCase"]>[2]
) {
  return getStore().updateCase(id, ownerUid, patch);
}

export async function deleteCase(id: string, ownerUid: string) {
  return getStore().deleteCase(id, ownerUid);
}

/** Cron only. Never call this from a route reachable by a browser. */
export async function listAllOpenCases() {
  return getStore().listAllOpenCases();
}
