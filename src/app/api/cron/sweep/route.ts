// The daily deadline sweep, run automatically by Vercel Cron (see
// vercel.json at the repo root, "0 3 * * *", 03:00 UTC) rather than by
// a human pressing a button. Vercel signs its own scheduled invocations
// with an Authorization: Bearer <CRON_SECRET> header once CRON_SECRET
// is set as a project env var, so checking that header here is enough
// to reject anyone who finds this URL and calls it directly; there is
// no session check because Vercel Cron has no browser session to send,
// and listAllOpenCases() below reads across every citizen's cases,
// which is exactly why store.ts's own comment says it must never be
// reachable from a route a browser can hit unauthenticated.
//
// The actual per-case decision (sweepCase) and the patch it produces
// (buildSweepPatch) are both imported rather than reimplemented here,
// so this route and the citizen-facing "show me what happens if they
// miss the deadline" simulate button in src/app/my/[id]/page.tsx can
// never disagree about what an overdue case's first appeal looks like.

import { NextResponse } from "next/server";
import { listAllOpenCases, updateCase } from "@/lib/store";
import { sweepCase } from "@/lib/sweep";
import { buildSweepPatch } from "@/lib/sweepPatch";

// Mirrors scripts/seed-cases.ts's own pacing against the 30-writes-per-
// 60-second in-process limiter (src/lib/firestore/rateLimit.ts): a demo
// deployment has a small case count today, but nothing about this route
// should assume that stays true, and a sweep that throws RateLimitExceededError
// partway through a run would silently leave the remaining cases unswept
// until the next day's cron tick. Pacing at the same ~2500ms interval the
// seed script already uses keeps this comfortably under the limiter (24
// writes per 60s window) without needing a second, divergent constant.
const WRITE_PACE_MS = 2500;
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cases = await listAllOpenCases();
  let changed = 0;
  let wroteAtLeastOnce = false;

  for (const caseRecord of cases) {
    const result = sweepCase(caseRecord, new Date());
    if (!result.changed) continue;

    // Only pace before a write that actually follows another write, not
    // before the very first one, since there is nothing yet to protect
    // the limiter from at that point.
    if (wroteAtLeastOnce) {
      await sleep(WRITE_PACE_MS);
    }

    // updateCase requires the record's own ownerUid, not a placeholder,
    // since it was added specifically so one citizen's case can never be
    // mutated under another's identity; listAllOpenCases() already returns
    // full CaseRecords, so caseRecord.ownerUid is always the right one here.
    await updateCase(caseRecord.id, caseRecord.ownerUid, buildSweepPatch(caseRecord, result));
    changed += 1;
    wroteAtLeastOnce = true;
  }

  return NextResponse.json({ checked: cases.length, changed });
}
