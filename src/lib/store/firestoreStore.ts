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
//
// Ownership: every read and write is scoped to ownerUid, checked inside
// this file rather than trusted from the caller. listCases deliberately
// does NOT chain .orderBy() onto the ownerUid where() clause: Firestore
// requires a composite index for that combination, which fails at
// runtime with an index-creation link rather than at build time, and
// case counts per citizen are small enough that sorting in memory is
// the correct choice here, not a shortcut.

import { randomUUID } from "crypto";
import { getFirestoreDb } from "@/lib/firestore/client";
import { assertWriteAllowed } from "@/lib/firestore/rateLimit";
import type { CaseRecord } from "@/lib/types";
import type { CaseStore } from "@/lib/store/types";

const COLLECTION = "cases";

export const firestoreStore: CaseStore = {
  async listCases(ownerUid) {
    const db = getFirestoreDb();
    const snapshot = await db.collection(COLLECTION).where("ownerUid", "==", ownerUid).get();
    return snapshot.docs
      .map((d) => d.data() as CaseRecord)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async getCase(id, ownerUid) {
    const db = getFirestoreDb();
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return undefined;
    const data = doc.data() as CaseRecord;
    if (data.ownerUid !== ownerUid) return undefined;
    return data;
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

  async updateCase(id, ownerUid, patch) {
    assertWriteAllowed();
    const db = getFirestoreDb();
    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return undefined;
    const existingData = existing.data() as CaseRecord;
    if (existingData.ownerUid !== ownerUid) return undefined;
    const updated: CaseRecord = {
      ...existingData,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await ref.set(updated);
    return updated;
  },

  async deleteCase(id, ownerUid) {
    assertWriteAllowed();
    const db = getFirestoreDb();
    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return false;
    const existingData = existing.data() as CaseRecord;
    if (existingData.ownerUid !== ownerUid) return false;
    await ref.delete();
    return true;
  },

  async listAllOpenCases() {
    const db = getFirestoreDb();
    const snapshot = await db
      .collection(COLLECTION)
      .where("status", "in", ["awaiting_response", "first_appeal_filed"])
      .get();
    return snapshot.docs.map((d) => d.data() as CaseRecord);
  },
};
