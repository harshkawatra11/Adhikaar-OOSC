// Firestore-backed persistence, the production path. Every field on
// CaseRecord is already a plain string, number, boolean, array or plain
// object (dates are stored as ISO strings throughout the codebase, not
// native Date objects), so documents are written and read as-is with no
// serialisation layer to keep in sync.
//
// Every write goes through assertWriteAllowed() first, the in-process
// backstop described in rateLimit.ts. It is a supplement to, not a
// substitute for, the Firestore free-tier ceiling and the GCP billing
// budget alert that are the actual cost controls for this project.

import { randomUUID } from "crypto";
import { getFirestoreDb } from "@/lib/firestore/client";
import { assertWriteAllowed } from "@/lib/firestore/rateLimit";
import type { CaseRecord } from "@/lib/types";
import type { CaseStore } from "@/lib/store/types";

const COLLECTION = "cases";

export const firestoreStore: CaseStore = {
  async listCases() {
    const db = getFirestoreDb();
    const snapshot = await db.collection(COLLECTION).orderBy("updatedAt", "desc").get();
    return snapshot.docs.map((d) => d.data() as CaseRecord);
  },

  async getCase(id) {
    const db = getFirestoreDb();
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? (doc.data() as CaseRecord) : undefined;
  },

  async createCase(partial) {
    assertWriteAllowed();
    const db = getFirestoreDb();
    const now = new Date().toISOString();
    const record: CaseRecord = {
      ...partial,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await db.collection(COLLECTION).doc(record.id).set(record);
    return record;
  },

  async updateCase(id, patch) {
    assertWriteAllowed();
    const db = getFirestoreDb();
    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return undefined;
    const updated: CaseRecord = {
      ...(existing.data() as CaseRecord),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await ref.set(updated);
    return updated;
  },

  async deleteCase(id) {
    assertWriteAllowed();
    const db = getFirestoreDb();
    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return false;
    await ref.delete();
    return true;
  },
};
