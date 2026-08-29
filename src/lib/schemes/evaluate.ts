// The scheme eligibility decision. Plain code, no model, mirroring the
// discipline src/lib/jurisdiction.ts and src/lib/remedy.ts already
// hold for RTI: a model may propose and phrase, it may never decide.
// The evaluator never guesses an "unknown" into "met": a criterion
// whose test() returns null because the profile is missing the field
// it needs stays unknown, and a scheme with any unknown criterion (and
// no not_met criterion) reports more_information_needed rather than a
// false eligible.

import { SCHEMES, type Scheme, type CitizenProfile } from "@/lib/data/schemes";

export type CriterionOutcome = "met" | "not_met" | "unknown";

export interface CriterionResult {
  id: string;
  labelEn: string;
  labelHi: string;
  outcome: CriterionOutcome;
  ruleTextEn: string;
  ruleTextHi: string;
}

export type SchemeVerdict = "eligible" | "not_eligible" | "more_information_needed";

export interface SchemeResult {
  schemeId: string;
  verdict: SchemeVerdict;
  criteria: CriterionResult[];
}

function evaluateCriterion(criterion: Scheme["criteria"][number], profile: CitizenProfile): CriterionResult {
  const raw = criterion.test(profile);
  const outcome: CriterionOutcome = raw === null ? "unknown" : raw ? "met" : "not_met";
  return {
    id: criterion.id,
    labelEn: criterion.labelEn,
    labelHi: criterion.labelHi,
    outcome,
    ruleTextEn: criterion.ruleTextEn,
    ruleTextHi: criterion.ruleTextHi,
  };
}

export function evaluateScheme(profile: CitizenProfile, scheme: Scheme): SchemeResult {
  const criteria = scheme.criteria.map((c) => evaluateCriterion(c, profile));

  let verdict: SchemeVerdict;
  if (criteria.some((c) => c.outcome === "not_met")) {
    verdict = "not_eligible";
  } else if (criteria.some((c) => c.outcome === "unknown")) {
    verdict = "more_information_needed";
  } else {
    verdict = "eligible";
  }

  return { schemeId: scheme.id, verdict, criteria };
}

export function evaluateAllSchemes(profile: CitizenProfile): SchemeResult[] {
  return SCHEMES.map((s) => evaluateScheme(profile, s)).sort((a, b) => {
    const rank: Record<SchemeVerdict, number> = { eligible: 0, more_information_needed: 1, not_eligible: 2 };
    return rank[a.verdict] - rank[b.verdict];
  });
}
