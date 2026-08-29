// Turns a sweepCase() result into the Partial<CaseRecord> patch that
// gets written back to the store. Lives in its own module, separate
// from actions.ts, because actions.ts carries the "use server"
// directive, and Next.js requires every top-level export of a "use
// server" file to itself be an async Server Action; a plain synchronous
// helper like this one cannot live there once the file has that
// directive (the build fails with "Server Actions must be async
// functions" otherwise).
//
// Shared between runSweepAction (the citizen-facing "show me what
// happens if they miss the deadline" simulate button on
// src/app/my/[id]/page.tsx, via src/lib/actions.ts) and the daily cron
// route (src/app/api/cron/sweep/route.ts) specifically so the two paths
// can never drift: if the demo button and the real overnight sweep
// built the operatorNotes / deadlines patch differently, a judge who
// triggers the manual demo and then checks back after the cron run
// swept the same case for real would see a different first-appeal
// draft the second time, which would look like a bug even though
// nothing is actually wrong.

import type { CaseRecord } from "@/lib/types";
import type { SweepResult } from "@/lib/sweep";

export function buildSweepPatch(current: CaseRecord, result: SweepResult): Partial<CaseRecord> {
  const remainingDeadlines = current.deadlines.filter(
    (d) => !result.updatedDeadlines.some((u) => u.id === d.id)
  );

  const patch: Partial<CaseRecord> = {
    deadlines: [...remainingDeadlines, ...result.updatedDeadlines, ...result.newDeadlines],
  };
  if (result.nextStatus) patch.status = result.nextStatus;
  if (result.firstAppealDraft) {
    patch.operatorNotes = `${current.operatorNotes}\n\n--- Auto-drafted first appeal (${new Date().toISOString().slice(0, 10)}) ---\n${result.firstAppealDraft}`.trim();
  }
  return patch;
}
