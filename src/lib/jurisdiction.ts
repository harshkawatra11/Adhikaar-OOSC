// The jurisdiction triage engine. Deterministic by design: this is the
// decision that the DoLR evidence shows citizens actually lose money and
// time over, and a wrong guess here is worse than an admitted gap. An
// LLM may be used elsewhere in the pipeline to extract or phrase text,
// but the verdict produced here is plain code, testable and auditable.

import { classifySubjectMatter } from "@/lib/data/seventh-schedule";
import { AUTHORITIES, searchAuthorities } from "@/lib/data/authorities";
import type { AuthorityCandidate, JurisdictionTriageResult } from "@/lib/types";

export interface TriageInput {
  grievanceText: string;
  state?: string;
  selectedAuthorityId?: string;
}

export function runJurisdictionTriage(input: TriageInput): JurisdictionTriageResult {
  const mapping = classifySubjectMatter(input.grievanceText);

  if (!mapping) {
    return {
      level: "unknown",
      subjectMatter: "Not confidently classified",
      scheduleEntry: "",
      scheduleList: "Unclassified",
      candidates: [],
      blockingWarning: {
        message:
          "The subject matter of this grievance could not be matched against the covered Seventh Schedule categories. Do not select an authority automatically. Ask the operator to identify the subject by hand before drafting.",
        citationId: "rti-6-3",
      },
      computedAt: new Date().toISOString(),
    };
  }

  const level = mapping.list === "Union" ? "union" : mapping.list === "State" ? "state" : "concurrent";

  const candidates = buildCandidates(mapping, input.state);

  const result: JurisdictionTriageResult = {
    level,
    subjectMatter: mapping.subjectMatter,
    scheduleEntry: mapping.entry,
    scheduleList: mapping.list,
    candidates,
    computedAt: new Date().toISOString(),
  };

  if (mapping.list === "State" && candidates.length === 0) {
    result.blockingWarning = {
      message: `${mapping.subjectMatter} is a State subject (${mapping.entry}). This directory does not currently cover an authority for the state you specified, so Adhikaar will not suggest one. Filing this with a central authority will very likely be returned without a refund: the section 6(3) transfer duty does not apply across the Union-State line under DoPT OM No. 10/2/2008-IR.`,
      citationId: "rti-6-3",
    };
  }

  if (input.selectedAuthorityId) {
    const chosen = AUTHORITIES.find((a) => a.id === input.selectedAuthorityId);
    if (chosen && mapping.list === "State" && chosen.jurisdiction === "union") {
      result.blockingWarning = {
        message: `${mapping.subjectMatter} is a State subject (${mapping.entry}), but the selected authority, ${chosen.name}, is a Central authority. Under DoPT OM No. 10/2/2008-IR, a Central Public Information Officer is not required to transfer a State-subject application: it will be returned to the applicant, without a refund of the fee. Select the correct State authority instead.`,
        citationId: "rti-6-3",
      };
    }
  }

  return result;
}

function buildCandidates(
  mapping: NonNullable<ReturnType<typeof classifySubjectMatter>>,
  state?: string
): AuthorityCandidate[] {
  const level = mapping.list === "Union" ? "union" : mapping.list === "State" ? "state" : "concurrent";

  let pool = AUTHORITIES.filter((a) =>
    a.subjectKeywords.some((k) => mapping.keywords.includes(k)) ||
    a.name.toLowerCase().includes(mapping.subjectMatter.toLowerCase().split(" ")[0])
  );

  if (mapping.list === "State" && state) {
    pool = searchAuthorities({ jurisdiction: "state", state });
  } else if (mapping.list === "Union") {
    pool = pool.filter((a) => a.jurisdiction === "union");
    if (pool.length === 0) {
      pool = AUTHORITIES.filter((a) => a.jurisdiction === "union");
    }
  }

  return pool.slice(0, 3).map((a, idx) => ({
    authorityId: a.id,
    authorityName: a.name,
    department: a.department,
    jurisdiction: a.jurisdiction,
    state: a.state,
    cpioAddress: a.cpioAddress,
    faaAddress: a.faaAddress,
    confidence: idx === 0 ? 0.78 : idx === 1 ? 0.52 : 0.35,
    reasoning: `Matched on subject matter "${mapping.subjectMatter}" (${mapping.entry}). ${a.coverageNote || "No specific coverage caveat recorded for this authority."}`,
    sourceCitationId: level === "state" ? "rti-6-3" : "rti-6-1",
  }));
}
