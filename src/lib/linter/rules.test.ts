import { describe, it, expect } from "vitest";
import { LINT_RULES, lintQuestion } from "@/lib/linter/rules";
import { resolveCitation } from "@/lib/citations";

// Every rule gets one fixture that must fire it and one that must not.
// This is the test suite the product's own README promises: eighteen
// rules, each with a passing and a failing case, each citation checked
// against real corpus text rather than trusted on faith.

interface Fixture {
  ruleId: string;
  fires: string;
  doesNotFire: string;
}

const FIXTURES: Fixture[] = [
  {
    ruleId: "opinion-seeking",
    fires: "Why did the department reject my application",
    doesNotFire: "Please provide a certified copy of the rejection order dated 12 March 2024",
  },
  {
    ruleId: "life-liberty-fast-track",
    fires: "This concerns a missing person who is in custody and it is life-threatening",
    doesNotFire: "Please provide a certified copy of the mutation register",
  },
  {
    ruleId: "overbroad-unbounded",
    fires: "Please provide all files since inception relating to this scheme",
    doesNotFire: "Please provide a certified copy of the order dated 12 March 2020",
  },
  {
    ruleId: "personal-info-8-1-j",
    fires: "Please provide the salary of Mr Sharma employed in this office",
    doesNotFire: "Please provide a certified copy of the sanctioned building plan",
  },
  {
    ruleId: "third-party-commercial",
    fires: "Please provide the business plan of the vendor who won this tender",
    doesNotFire: "Please provide a certified copy of the mutation register",
  },
  {
    ruleId: "investigation-in-progress",
    fires: "Please provide the file relating to the matter that is under investigation",
    doesNotFire: "Please provide a certified copy of the order dated 12 March 2020",
  },
  {
    ruleId: "cabinet-papers",
    fires: "Please provide the cabinet note discussed in the last council of ministers deliberation",
    doesNotFire: "Please provide a certified copy of the sanctioned building plan",
  },
  {
    ruleId: "court-forbidden",
    fires: "Please provide the file relating to the matter that is sub judice",
    doesNotFire: "Please provide a certified copy of the sanctioned building plan",
  },
  {
    ruleId: "security-organisation",
    fires: "Please provide the RAW file relating to this matter",
    doesNotFire: "Please provide a certified copy of the sanctioned building plan",
  },
  {
    ruleId: "copyright-third-party",
    fires: "Please provide a copy of the published book held in the departmental library",
    doesNotFire: "Please provide a certified copy of the sanctioned building plan",
  },
  {
    ruleId: "sovereignty-security",
    fires: "Please provide details of the national security assessment for this facility",
    doesNotFire: "Please provide a certified copy of the sanctioned building plan",
  },
  {
    ruleId: "fiduciary-relationship",
    fires: "Please provide the doctor's notes on the patient treated in this hospital",
    doesNotFire: "Please provide a certified copy of the sanctioned building plan",
  },
  {
    ruleId: "foreign-government-confidence",
    fires: "Please provide the information shared by the us embassy in confidence",
    doesNotFire: "Please provide a certified copy of the sanctioned building plan",
  },
  {
    ruleId: "parliamentary-privilege",
    fires: "Please provide the record of parliamentary committee proceedings on this bill",
    doesNotFire: "Please provide a certified copy of the sanctioned building plan",
  },
  {
    ruleId: "third-party-notice-timeline",
    fires: "Please provide information about a competitor that was submitted in the tender",
    doesNotFire: "Please provide a certified copy of the sanctioned building plan",
  },
  {
    ruleId: "language-of-application",
    fires: "Je voudrais des informations en francais sur ce dossier",
    doesNotFire: "Please provide a certified copy of the sanctioned building plan",
  },
  {
    ruleId: "no-reason-required-check",
    fires: "Please provide the record, i need this because my son is applying for a job",
    doesNotFire: "Please provide a certified copy of the sanctioned building plan",
  },
  {
    ruleId: "twenty-year-sunset",
    fires: "Please provide the file relating to the decision made in 1985",
    doesNotFire: "Please provide a certified copy of the order dated 12 March 2020",
  },
];

describe("every rule has a corresponding fixture", () => {
  it("fixture table covers every declared rule exactly once", () => {
    const ruleIds = LINT_RULES.map((r) => r.id).sort();
    const fixtureIds = FIXTURES.map((f) => f.ruleId).sort();
    expect(fixtureIds).toEqual(ruleIds);
  });
});

describe.each(FIXTURES)("rule: $ruleId", ({ ruleId, fires, doesNotFire }) => {
  it("fires on its trigger text", () => {
    const findings = lintQuestion(fires);
    expect(findings.some((f) => f.ruleId === ruleId)).toBe(true);
  });

  it("does not fire on an ordinary, bounded records request", () => {
    const findings = lintQuestion(doesNotFire);
    expect(findings.some((f) => f.ruleId === ruleId)).toBe(false);
  });

  it("cites a citation id that resolves to real corpus text", () => {
    const rule = LINT_RULES.find((r) => r.id === ruleId)!;
    const chunk = resolveCitation(rule.citationId);
    expect(chunk.text.length).toBeGreaterThan(20);
  });
});

describe("the opinion-seeking rewrite", () => {
  it("turns a why-question into a records request", () => {
    const findings = lintQuestion("Why was my application rejected");
    const finding = findings.find((f) => f.ruleId === "opinion-seeking");
    expect(finding?.suggestedRewrite).toMatch(/certified copy/i);
    expect(finding?.suggestedRewrite).not.toMatch(/^why/i);
  });
});
