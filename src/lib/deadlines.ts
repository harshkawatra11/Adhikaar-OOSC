// Statutory clock. Pure date arithmetic, no external calls, and no
// judgment calls: every function here should be exact, and the test
// suite in deadlines.test.ts holds it to that standard.

import type { Deadline } from "@/lib/types";

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface DeadlineInputs {
  filedDate: string; // ISO yyyy-mm-dd
  lifeOrLiberty: boolean;
  viaApio: boolean;
}

export function computeInitialDeadlines(input: DeadlineInputs): Deadline[] {
  const deadlines: Deadline[] = [];

  if (input.lifeOrLiberty) {
    deadlines.push({
      id: "response-48h",
      label: "Response due (life or liberty track)",
      basis: "Section 7(1) proviso",
      citationId: "rti-7-1",
      dueDate: addHours(input.filedDate, 48),
      status: "pending",
    });
  } else {
    const days = input.viaApio ? 35 : 30;
    deadlines.push({
      id: "response-30d",
      label: `Response due (${days} days${input.viaApio ? ", filed via an Assistant Public Information Officer" : ""})`,
      basis: input.viaApio ? "Section 5(2) read with section 7(1)" : "Section 7(1)",
      citationId: "rti-7-1",
      dueDate: addDays(input.filedDate, days),
      status: "pending",
    });
  }

  return deadlines;
}

function addHours(iso: string, hours: number): string {
  const d = new Date(iso);
  d.setUTCHours(d.getUTCHours() + hours);
  return d.toISOString().slice(0, 10);
}

/** Called when the response deadline passes with no reply on record. */
export function computeDeemedRefusalAppealWindow(responseDeadline: string): Deadline {
  return {
    id: "first-appeal-window",
    label: "First appeal due (deemed refusal)",
    basis: "Section 19(1)",
    citationId: "rti-19-1",
    dueDate: addDays(responseDeadline, 30),
    status: "pending",
  };
}

export function computeFirstAppealDisposalDeadline(appealFiledDate: string): Deadline {
  return {
    id: "first-appeal-disposal",
    label: "First appeal must be disposed of by",
    basis: "Section 19(6), extendable to a total of 45 days for recorded reasons",
    citationId: "rti-19-6",
    dueDate: addDays(appealFiledDate, 30),
    status: "pending",
  };
}

export function computeSecondAppealWindow(firstAppealDecisionOrDeadline: string): Deadline {
  return {
    id: "second-appeal-window",
    label: "Second appeal due (to the Information Commission)",
    basis: "Section 19(3)",
    citationId: "rti-19-3",
    dueDate: addDays(firstAppealDecisionOrDeadline, 90),
    status: "pending",
  };
}

export function isOverdue(deadline: Deadline, asOf: Date = new Date()): boolean {
  return deadline.status === "pending" && new Date(deadline.dueDate + "T23:59:59Z") < asOf;
}

export function daysUntil(deadline: Deadline, asOf: Date = new Date()): number {
  const due = new Date(deadline.dueDate + "T23:59:59Z");
  return Math.ceil((due.getTime() - asOf.getTime()) / (1000 * 60 * 60 * 24));
}
