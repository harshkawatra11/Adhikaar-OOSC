// File-backed persistence for the prototype.
//
// The architecture this product argues for is Firestore-backed, org
// scoped, with Cloud Scheduler running the daily deadline sweep. That
// remains the intended production path and is documented in the README.
// For a working demo that does not depend on a provisioned Firebase
// project or committed service-account credentials, this module persists
// the same CaseRecord shape to a JSON file on disk behind the same
// function signatures a Firestore-backed store would expose, so swapping
// the backing store later touches this one file, not the call sites.
//
// The deployment target matters here. A serverless function's own
// bundle directory, what process.cwd() resolves to on Vercel, is
// read-only at runtime; only /tmp is writable, and it is ephemeral,
// wiped between cold starts and not shared across concurrent instances.
// That is an intentional, disclosed limitation of this prototype's
// storage layer, not a bug to hide: on a serverless host, data written
// during a demo can disappear on the next cold start, which is exactly
// why the production path is Firestore, not this file. Locally, where
// the process persists between requests, .data/cases.json behaves like
// a real database for as long as the dev server keeps running.

import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import type { CaseRecord } from "@/lib/types";

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

export async function listCases(): Promise<CaseRecord[]> {
  const cases = await readAll();
  return cases.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getCase(id: string): Promise<CaseRecord | undefined> {
  const cases = await readAll();
  return cases.find((c) => c.id === id);
}

export async function createCase(
  partial: Omit<CaseRecord, "id" | "createdAt" | "updatedAt">
): Promise<CaseRecord> {
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
}

export async function updateCase(
  id: string,
  patch: Partial<Omit<CaseRecord, "id" | "createdAt">>
): Promise<CaseRecord | undefined> {
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
}

export async function deleteCase(id: string): Promise<boolean> {
  const cases = await readAll();
  const next = cases.filter((c) => c.id !== id);
  await writeAll(next);
  return next.length !== cases.length;
}
