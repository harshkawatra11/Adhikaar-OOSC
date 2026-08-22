import { describe, it, expect } from "vitest";
import {
  computeInitialDeadlines,
  computeDeemedRefusalAppealWindow,
  computeFirstAppealDisposalDeadline,
  computeSecondAppealWindow,
  isOverdue,
  daysUntil,
} from "@/lib/deadlines";

describe("computeInitialDeadlines", () => {
  it("gives thirty days from filing under the ordinary section 7(1) track", () => {
    const [d] = computeInitialDeadlines({ filedDate: "2026-01-01", lifeOrLiberty: false, viaApio: false });
    expect(d.dueDate).toBe("2026-01-31");
    expect(d.basis).toBe("Section 7(1)");
  });

  it("gives thirty-five days when filed via an Assistant Public Information Officer", () => {
    const [d] = computeInitialDeadlines({ filedDate: "2026-01-01", lifeOrLiberty: false, viaApio: true });
    expect(d.dueDate).toBe("2026-02-05");
  });

  it("gives forty-eight hours on the life-or-liberty track", () => {
    const [d] = computeInitialDeadlines({ filedDate: "2026-01-01", lifeOrLiberty: true, viaApio: false });
    expect(d.dueDate).toBe("2026-01-03");
    expect(d.basis).toBe("Section 7(1) proviso");
  });

  it("correctly crosses a month boundary", () => {
    const [d] = computeInitialDeadlines({ filedDate: "2026-01-15", lifeOrLiberty: false, viaApio: false });
    expect(d.dueDate).toBe("2026-02-14");
  });
});

describe("computeDeemedRefusalAppealWindow", () => {
  it("gives thirty days from the missed response deadline", () => {
    const d = computeDeemedRefusalAppealWindow("2026-01-31");
    expect(d.dueDate).toBe("2026-03-02");
    expect(d.basis).toBe("Section 19(1)");
  });
});

describe("computeFirstAppealDisposalDeadline", () => {
  it("gives thirty days from the appeal filing date", () => {
    const d = computeFirstAppealDisposalDeadline("2026-03-02");
    expect(d.dueDate).toBe("2026-04-01");
  });
});

describe("computeSecondAppealWindow", () => {
  it("gives ninety days for a second appeal", () => {
    const d = computeSecondAppealWindow("2026-04-01");
    expect(d.dueDate).toBe("2026-06-30");
    expect(d.basis).toBe("Section 19(3)");
  });
});

describe("isOverdue and daysUntil", () => {
  it("treats a future pending deadline as not overdue", () => {
    const d = { id: "x", label: "x", basis: "x", citationId: "rti-7-1", dueDate: "2099-01-01", status: "pending" as const };
    expect(isOverdue(d, new Date("2026-01-01"))).toBe(false);
    expect(daysUntil(d, new Date("2098-12-31T00:00:00Z"))).toBeGreaterThan(0);
  });

  it("treats a past pending deadline as overdue", () => {
    const d = { id: "x", label: "x", basis: "x", citationId: "rti-7-1", dueDate: "2020-01-01", status: "pending" as const };
    expect(isOverdue(d, new Date("2026-01-01"))).toBe(true);
  });

  it("does not mark an already-met deadline as overdue", () => {
    const d = { id: "x", label: "x", basis: "x", citationId: "rti-7-1", dueDate: "2020-01-01", status: "met" as const };
    expect(isOverdue(d, new Date("2026-01-01"))).toBe(false);
  });
});
