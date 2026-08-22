// The daily deadline sweep. In production this runs as a Cloud Scheduler
// job invoking a Cloud Function once a day across every open case; here
// it is a pure function over one case plus "now", called either by that
// same kind of job or, for demonstration, by an operator pressing a
// button. The logic does not change depending on who calls it, which is
// the point: a sweep you can only trust when a human triggers it is not
// really automated.

import type { CaseRecord, Deadline } from "@/lib/types";
import { isOverdue, computeDeemedRefusalAppealWindow, computeSecondAppealWindow } from "@/lib/deadlines";
import { AUTHORITIES } from "@/lib/data/authorities";

export interface SweepResult {
  changed: boolean;
  nextStatus?: CaseRecord["status"];
  newDeadlines: Deadline[];
  updatedDeadlines: Deadline[];
  firstAppealDraft?: string;
}

export function sweepCase(caseRecord: CaseRecord, now: Date = new Date()): SweepResult {
  const result: SweepResult = { changed: false, newDeadlines: [], updatedDeadlines: [] };

  if (caseRecord.status !== "awaiting_response" && caseRecord.status !== "first_appeal_filed") {
    return result;
  }

  const responseDeadline = caseRecord.deadlines.find((d) => d.id === "response-30d" || d.id === "response-48h");

  if (
    caseRecord.status === "awaiting_response" &&
    responseDeadline &&
    responseDeadline.status === "pending" &&
    isOverdue(responseDeadline, now)
  ) {
    const missed: Deadline = { ...responseDeadline, status: "missed" };
    result.updatedDeadlines.push(missed);

    const appealWindow = computeDeemedRefusalAppealWindow(responseDeadline.dueDate);
    result.newDeadlines.push(appealWindow);

    result.changed = true;
    result.nextStatus = "first_appeal_drafted";
    result.firstAppealDraft = draftFirstAppeal(caseRecord, responseDeadline);
    return result;
  }

  const firstAppealDeadline = caseRecord.deadlines.find((d) => d.id === "first-appeal-disposal");
  if (
    caseRecord.status === "first_appeal_filed" &&
    firstAppealDeadline &&
    firstAppealDeadline.status === "pending" &&
    isOverdue(firstAppealDeadline, now)
  ) {
    const missed: Deadline = { ...firstAppealDeadline, status: "missed" };
    result.updatedDeadlines.push(missed);
    const secondWindow = computeSecondAppealWindow(firstAppealDeadline.dueDate);
    result.newDeadlines.push(secondWindow);
    result.changed = true;
    result.nextStatus = "second_appeal_drafted";
    return result;
  }

  return result;
}

function draftFirstAppeal(caseRecord: CaseRecord, missedDeadline: Deadline): string {
  const authority = AUTHORITIES.find((a) => a.id === caseRecord.selectedAuthorityId);
  const filed = caseRecord.filedDate ?? "the date this application was filed";

  const lines = [
    "FIRST APPEAL UNDER SECTION 19(1) OF THE RIGHT TO INFORMATION ACT, 2005",
    "",
    "To,",
    authority?.faaAddress ?? "The Appellate Authority, [authority not selected]",
    "",
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "Subject: First appeal against deemed refusal under section 7(2)",
    "",
    `Sir or Madam,`,
    "",
    `I filed an application under section 6(1) of the Right to Information Act, 2005 on ${filed}, addressed to the Public Information Officer, seeking the information set out below. No decision was communicated within the period specified in section 7(1), which expired on ${missedDeadline.dueDate}. Under section 7(2) of the Act, the Public Information Officer is deemed to have refused the request.`,
    "",
    "Particulars of information originally sought:",
    ...caseRecord.questions.map((q, i) => `${i + 1}. ${q.text}`),
    "",
    `As the statutory time limit was not met, I submit that, under section 7(6) of the Act, this information must now be provided to me free of charge, notwithstanding any fee otherwise prescribed.`,
    "",
    "I request that this appeal be disposed of within the time limit prescribed under section 19(6) of the Act, and that the Public Information Officer be directed to furnish the information sought without further delay and without any fee.",
    "",
    "Yours faithfully,",
    caseRecord.applicant.name,
    "",
    "---",
    "This appeal was drafted automatically by Adhikaar on the date the statutory response deadline lapsed, citing sections 7(2), 19(1) and 7(6) of the Right to Information Act, 2005. It is a draft for human review before filing, not legal advice.",
  ];

  return lines.join("\n");
}
