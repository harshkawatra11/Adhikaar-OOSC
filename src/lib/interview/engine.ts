// The step-transition function. Pure: no store access, no model call,
// no side effects. Given the current step, the answers collected so
// far, and the two triage results (computed by the caller via
// runJurisdictionTriage/runRemedyTriage, both already deterministic
// code in src/lib), decide the next step. See engine.test.ts for the
// four complete paths this must walk correctly: a clean Central RTI, a
// State subject that trips the jurisdiction engine's blocking warning,
// a consumer complaint diverted away from RTI, and an out-of-coverage
// tenancy case.

import type { StepId, Answers } from "@/lib/interview/graph";
import type { JurisdictionTriageResult, RemedyTriageResult } from "@/lib/types";

/** Returns the next step, or null when `current` is a terminal step
 *  (review or out_of_coverage). */
export function nextStep(
  current: StepId,
  answers: Answers,
  jurisdiction: JurisdictionTriageResult,
  remedy: RemedyTriageResult
): StepId | null {
  switch (current) {
    case "problem":
      return "triage_result";

    case "triage_result":
      if (remedy.remedyClass !== "rti") return "wrong_instrument";
      return afterInstrumentCheck(jurisdiction);

    case "wrong_instrument":
      if (remedy.outOfCoverage) return "out_of_coverage";
      return afterInstrumentCheck(jurisdiction);

    case "state":
      return "authority";

    case "authority":
      if (jurisdiction.candidates.length === 0) return "out_of_coverage";
      return "questions";

    case "questions":
      return "applicant";

    case "applicant":
      return "review";

    case "review":
      return null;

    case "out_of_coverage":
      return null;

    default:
      return null;
  }
}

function afterInstrumentCheck(jurisdiction: JurisdictionTriageResult): StepId {
  if (jurisdiction.scheduleList === "State" || jurisdiction.scheduleList === "Concurrent") {
    return "state";
  }
  return "authority";
}

/** True once the interview has reached a step with nothing further to
 *  ask; the caller should render a terminal screen rather than a form. */
export function isTerminal(step: StepId): boolean {
  return step === "review" || step === "out_of_coverage";
}
