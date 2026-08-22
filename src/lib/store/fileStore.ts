// File-backed persistence. The fallback path, used automatically when
// Firestore is not configured (no service account in the environment),
// which keeps local development working with zero setup.
//
// The deployment target matters here. A serverless function's own
// bundle directory, what process.cwd() resolves to on Vercel, is
// read-only at runtime; only /tmp is writable, and it is ephemeral,
// wiped between cold starts and not shared across concurrent instances.
// On Vercel this store writes to /tmp for exactly that reason, and data
// written there can still disappear between requests that land on
// different instances. That is why Firestore (see firestoreStore.ts) is
// the real production path; this file exists so the product runs with
// no cloud account at all.

import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import type { CaseRecord } from "@/lib/types";
import type { CaseStore } from "@/lib/store/types";

const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "adhikaar-data")
  : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "cases.json");

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

async function readAll(): Promise<CaseRecord[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw) as CaseRecord[];
  } catch {
    return [];
  }
}

async function writeAll(cases: CaseRecord[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(cases, null, 2), "utf-8");
}

export const fileStore: CaseStore = {
  async listCases() {
    const cases = await readAll();
    return cases.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async getCase(id) {
    const cases = await readAll();
    return cases.find((c) => c.id === id);
  },

  async createCase(partial) {
    const cases = await readAll();
    const now = new Date().toISOString();
    const record: CaseRecord = {
      ...partial,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    cases.push(record);
    await writeAll(cases);
    return record;
  },

  async updateCase(id, patch) {
    const cases = await readAll();
    const idx = cases.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    cases[idx] = {
      ...cases[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await writeAll(cases);
    return cases[idx];
  },

  async deleteCase(id) {
    const cases = await readAll();
    const next = cases.filter((c) => c.id !== id);
    await writeAll(next);
    return next.length !== cases.length;
  },
};
