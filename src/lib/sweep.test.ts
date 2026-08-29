import { describe, it, expect } from "vitest";
import { sweepCase } from "@/lib/sweep";
import { computeInitialDeadlines } from "@/lib/deadlines";
import type { CaseRecord } from "@/lib/types";

function baseCase(overrides: Partial<CaseRecord> = {}): CaseRecord {
  return {
    id: "test-case",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    status: "awaiting_response",
    ownerUid: "test-owner",
    applicant: { name: "Test Applicant", address: "Test Address", isBpl: false, preferredLanguage: "English" },
    grievanceSummary: "Test grievance",
    grievanceRaw: "Test grievance about land records",
    lowConfidenceFields: [],
    selectedAuthorityId: "mh-revenue",
    questions: [{ id: "q1", text: "Please provide a certified copy of the mutation register", findings: [] }],
    deadlines: computeInitialDeadlines({ filedDate: "2026-07-01", lifeOrLiberty: false, viaApio: false }),
    filedDate: "2026-07-01",
    operatorNotes: "",
    ...overrides,
  };
}

describe("sweepCase: the deadline-to-appeal pipeline", () => {
  it("does nothing while the response deadline has not yet passed", () => {
    const result = sweepCase(baseCase(), new Date("2026-07-15"));
    expect(result.changed).toBe(false);
  });

  it("does nothing for a case that has not been filed", () => {
    const result = sweepCase(baseCase({ status: "drafted" }), new Date("2026-12-01"));
    expect(result.changed).toBe(false);
  });

  it("moves a case with a lapsed response deadline to a deemed refusal and drafts the first appeal", () => {
    const result = sweepCase(baseCase(), new Date("2026-08-15"));
    expect(result.changed).toBe(true);
    expect(result.nextStatus).toBe("first_appeal_drafted");
    expect(result.updatedDeadlines[0].status).toBe("missed");
  });

  it("computes the first appeal window as thirty days from the missed response deadline", () => {
    const result = sweepCase(baseCase(), new Date("2026-08-15"));
    const appealWindow = result.newDeadlines.find((d) => d.id === "first-appeal-window");
    expect(appealWindow?.dueDate).toBe("2026-08-30");
    expect(appealWindow?.citationId).toBe("rti-19-1");
  });

  it("drafts a first appeal that cites the right sections and includes the original questions", () => {
    const result = sweepCase(baseCase(), new Date("2026-08-15"));
    expect(result.firstAppealDraft).toMatch(/section 7\(2\)/i);
    expect(result.firstAppealDraft).toMatch(/section 19\(1\)/i);
    expect(result.firstAppealDraft).toMatch(/section 7\(6\)/i);
    expect(result.firstAppealDraft).toMatch(/free of charge/i);
    expect(result.firstAppealDraft).toContain("Please provide a certified copy of the mutation register");
    expect(result.firstAppealDraft).toContain("2026-07-31");
  });

  it("addresses the drafted appeal to the correct appellate authority for the selected authority", () => {
    const result = sweepCase(baseCase({ selectedAuthorityId: "mh-revenue" }), new Date("2026-08-15"));
    expect(result.firstAppealDraft).toContain("Mantralaya, Mumbai");
  });

  it("does not touch a case whose response deadline is not yet due, even far into the future run", () => {
    const filedRecently = baseCase({
      deadlines: computeInitialDeadlines({ filedDate: "2026-08-20", lifeOrLiberty: false, viaApio: false }),
    });
    const result = sweepCase(filedRecently, new Date("2026-08-25"));
    expect(result.changed).toBe(false);
  });

  it("advances a case with a lapsed first-appeal disposal deadline to a drafted second appeal", () => {
    const filed = baseCase({
      status: "first_appeal_filed",
      deadlines: [
        { id: "response-30d", label: "x", basis: "Section 7(1)", citationId: "rti-7-1", dueDate: "2026-07-31", status: "missed" },
        { id: "first-appeal-disposal", label: "x", basis: "Section 19(6)", citationId: "rti-19-6", dueDate: "2026-09-15", status: "pending" },
      ],
    });
    const result = sweepCase(filed, new Date("2026-10-01"));
    expect(result.changed).toBe(true);
    expect(result.nextStatus).toBe("second_appeal_drafted");
    const secondWindow = result.newDeadlines.find((d) => d.id === "second-appeal-window");
    expect(secondWindow?.dueDate).toBe("2026-12-14");
  });
});
