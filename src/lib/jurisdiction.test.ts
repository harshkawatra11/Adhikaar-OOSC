import { describe, it, expect } from "vitest";
import { runJurisdictionTriage } from "@/lib/jurisdiction";

// A small gold set standing in for the DoLR-derived evaluation described
// in the project README: a handful of hand-labelled grievances with a
// known correct Union/State classification, checked against the same
// code path the product runs.

describe("runJurisdictionTriage", () => {
  it("classifies a land record request as a State subject", () => {
    const r = runJurisdictionTriage({
      grievanceText: "I want the mutation register and khasra number 134 for my land in Nagpur",
      state: "Maharashtra",
    });
    expect(r.level).toBe("state");
    expect(r.scheduleList).toBe("State");
    expect(r.candidates[0]?.authorityId).toBe("mh-revenue");
  });

  it("classifies a passport request as a Union subject", () => {
    const r = runJurisdictionTriage({ grievanceText: "I want to know the status of my passport application" });
    expect(r.level).toBe("union");
    expect(r.candidates.some((c) => c.jurisdiction === "union")).toBe(true);
  });

  it("classifies a railway request as a Union subject", () => {
    const r = runJurisdictionTriage({ grievanceText: "I want information about a delayed train and railway compensation" });
    expect(r.level).toBe("union");
  });

  it("returns no candidates, not a guess, for a State subject with unlisted state coverage", () => {
    const r = runJurisdictionTriage({
      grievanceText: "I want the mutation register for my land in Kerala",
      state: "Kerala",
    });
    expect(r.level).toBe("state");
    expect(r.candidates.length).toBe(0);
    expect(r.blockingWarning).toBeDefined();
  });

  it("blocks selecting a central authority for a State subject", () => {
    const r = runJurisdictionTriage({
      grievanceText: "I want the mutation register and khasra number for my land in Nagpur",
      state: "Maharashtra",
      selectedAuthorityId: "dolr",
    });
    expect(r.blockingWarning).toBeDefined();
    expect(r.blockingWarning?.message).toMatch(/without a refund/);
  });

  it("does not classify subject matter it has no mapping for, and says so rather than guessing", () => {
    const r = runJurisdictionTriage({ grievanceText: "asdkjaslkdjaslkdj random unrelated text" });
    expect(r.level).toBe("unknown");
    expect(r.candidates.length).toBe(0);
    expect(r.blockingWarning).toBeDefined();
  });
});
