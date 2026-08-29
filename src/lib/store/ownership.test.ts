// Proves the ownership boundary added in WP1: a case created by one
// citizen must be invisible and immutable to every other citizen, at
// the store layer, not just in the UI. Run against fileStore since it
// needs no cloud credentials; firestoreStore implements the identical
// ownership checks (see firestoreStore.ts) and is not separately
// exercised here because it requires a live Firestore project.
//
// fileStore's DATA_DIR is computed once, at module import time, from
// process.cwd(). This suite chdir's into a fresh temporary directory
// before dynamically importing the module, so it never touches the
// real .data/cases.json this repository's own dev server uses.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import type { CaseStore } from "@/lib/store/types";
import type { CaseRecord } from "@/lib/types";

let fileStore: CaseStore;
let tmpDir: string;
let originalCwd: string;

const OWNER_A = "citizen-a";
const OWNER_B = "citizen-b";

function blankCase(ownerUid: string): Omit<CaseRecord, "id" | "createdAt" | "updatedAt"> {
  return {
    ownerUid,
    status: "triaged",
    applicant: { name: "Test Applicant", address: "Test Address", isBpl: false, preferredLanguage: "English" },
    grievanceSummary: "A test grievance",
    grievanceRaw: "A test grievance, written out in full.",
    lowConfidenceFields: [],
    questions: [],
    deadlines: [],
    operatorNotes: "",
  };
}

beforeAll(async () => {
  originalCwd = process.cwd();
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "adhikaar-ownership-test-"));
  process.chdir(tmpDir);
  ({ fileStore } = await import("@/lib/store/fileStore"));
});

afterAll(async () => {
  process.chdir(originalCwd);
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("store ownership boundary", () => {
  it("does not return a case created by another owner from getCase", async () => {
    const record = await fileStore.createCase(blankCase(OWNER_A));
    const asOwner = await fileStore.getCase(record.id, OWNER_A);
    const asStranger = await fileStore.getCase(record.id, OWNER_B);
    expect(asOwner?.id).toBe(record.id);
    expect(asStranger).toBeUndefined();
  });

  it("does not include another owner's case in listCases", async () => {
    const record = await fileStore.createCase(blankCase(OWNER_A));
    const bList = await fileStore.listCases(OWNER_B);
    expect(bList.find((c) => c.id === record.id)).toBeUndefined();
    const aList = await fileStore.listCases(OWNER_A);
    expect(aList.find((c) => c.id === record.id)).toBeDefined();
  });

  it("refuses to update another owner's case, and leaves it unchanged", async () => {
    const record = await fileStore.createCase(blankCase(OWNER_A));
    const result = await fileStore.updateCase(record.id, OWNER_B, { operatorNotes: "hijacked" });
    expect(result).toBeUndefined();
    const stillOwnedByA = await fileStore.getCase(record.id, OWNER_A);
    expect(stillOwnedByA?.operatorNotes).toBe("");
  });

  it("refuses to delete another owner's case, and it still exists afterward", async () => {
    const record = await fileStore.createCase(blankCase(OWNER_A));
    const deleted = await fileStore.deleteCase(record.id, OWNER_B);
    expect(deleted).toBe(false);
    const stillThere = await fileStore.getCase(record.id, OWNER_A);
    expect(stillThere?.id).toBe(record.id);
  });
});
