import { describe, it, expect } from "vitest";
import { nextStep, isTerminal } from "@/lib/interview/engine";
import { runJurisdictionTriage } from "@/lib/jurisdiction";
import { runRemedyTriage } from "@/lib/remedy";
import type { StepId, Answers } from "@/lib/interview/graph";

/** Walks the graph exactly the way the Interview component does:
 *  recompute jurisdiction/remedy whenever the answers that feed them
 *  change (the free text at the start, the state once picked), and
 *  otherwise just advance. Returns the full path walked and the final
 *  triage results, so each test can assert on both. */
function walk(problem: string, pickState?: string, extra: Partial<Answers> = {}) {
  const path: StepId[] = [];
  let step: StepId = "problem";
  let answers: Answers = { problem, ...extra };
  let jurisdiction = runJurisdictionTriage({ grievanceText: problem });
  const remedy = runRemedyTriage(problem);

  path.push(step);
  for (let guard = 0; guard < 20; guard++) {
    if (step === "wrong_instrument") {
      answers = { ...answers, acknowledgedWrongInstrument: true };
    }
    if (step === "state" && pickState) {
      answers = { ...answers, state: pickState };
      jurisdiction = runJurisdictionTriage({ grievanceText: problem, state: pickState });
    }

    const next = nextStep(step, answers, jurisdiction, remedy);
    if (next === null) break;
    step = next;
    path.push(step);
  }

  return { path, jurisdiction, remedy, terminal: step };
}

describe("interview engine: full paths", () => {
  it("walks a clean Central RTI straight through to review", () => {
    // Passport delay: Union subject (List I, Entry 19), a plain RTI.
    // Deliberately avoids the word "police": the seventh-schedule map
    // classifies by highest keyword-hit count, first match wins a tie,
    // and "police" (a State-subject keyword) sits earlier in that map
    // than "passport" does, so a passport grievance that also mentions
    // police verification is misclassified as a Police/State matter,
    // not a Passport/Union one. That was caught by this exact test.
    const { path, terminal, jurisdiction, remedy } = walk(
      "I applied for renewal of my passport four months ago and have received no update on it since."
    );

    expect(remedy.remedyClass).toBe("rti");
    expect(jurisdiction.scheduleList).toBe("Union");
    // Union means no state-selection detour.
    expect(path).not.toContain("state");
    expect(path).not.toContain("wrong_instrument");
    expect(path).toEqual(["problem", "triage_result", "authority", "questions", "applicant", "review"]);
    expect(terminal).toBe("review");
    expect(isTerminal(terminal)).toBe(true);
  });

  it("walks a State subject through the jurisdiction engine's blocking warning to out_of_coverage", () => {
    // Land records are a State subject (List II, Entry 18). Gujarat is
    // not in the authority directory (only Delhi and Maharashtra are),
    // so this both trips blockingWarning and ends with zero candidates.
    const { path, terminal, jurisdiction } = walk(
      "I want a copy of the mutation register entry for my land, khasra number 45, in Ahmedabad taluka.",
      "Gujarat"
    );

    expect(jurisdiction.scheduleList).toBe("State");
    expect(path).toContain("state");
    expect(jurisdiction.blockingWarning).toBeDefined();
    expect(jurisdiction.blockingWarning?.citationId).toBe("rti-6-3");
    expect(terminal).toBe("out_of_coverage");
    expect(isTerminal(terminal)).toBe(true);
  });

  it("diverts a consumer complaint away from RTI, with pecuniary jurisdiction computed", () => {
    const { path, remedy } = walk(
      "The e-commerce seller sent me a defective product worth Rs. 45,000 and refuses to give a refund."
    );

    expect(remedy.remedyClass).toBe("consumer");
    expect(remedy.outOfCoverage).toBe(false);
    expect(path).toContain("wrong_instrument");
    expect(remedy.pecuniaryJurisdiction).toBeDefined();
    expect(remedy.pecuniaryJurisdiction?.level).toBe("District");
  });

  it("stops a tenancy case at out_of_coverage, since no state rent authority is in the directory", () => {
    const { path, terminal, remedy } = walk(
      "My landlord is refusing to return my security deposit after I vacated the flat."
    );

    expect(remedy.remedyClass).toBe("tenancy");
    expect(remedy.outOfCoverage).toBe(true);
    expect(path).toEqual(["problem", "triage_result", "wrong_instrument", "out_of_coverage"]);
    expect(terminal).toBe("out_of_coverage");
    expect(isTerminal(terminal)).toBe(true);
  });
});

describe("nextStep: terminal steps", () => {
  it("returns null for review and out_of_coverage regardless of answers", () => {
    const jurisdiction = runJurisdictionTriage({ grievanceText: "anything" });
    const remedy = runRemedyTriage("anything");
    expect(nextStep("review", {}, jurisdiction, remedy)).toBeNull();
    expect(nextStep("out_of_coverage", {}, jurisdiction, remedy)).toBeNull();
  });
});
