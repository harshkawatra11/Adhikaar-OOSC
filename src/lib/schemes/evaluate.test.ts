import { describe, it, expect } from "vitest";
import { evaluateScheme } from "@/lib/schemes/evaluate";
import { SCHEMES, getScheme } from "@/lib/data/schemes";
import type { CitizenProfile } from "@/lib/data/schemes";

function scheme(id: string) {
  const s = getScheme(id);
  if (!s) throw new Error(`Test fixture bug: scheme "${id}" does not exist`);
  return s;
}

describe("evaluateScheme: pm-kisan", () => {
  it("is eligible for a landholding farmer who did not pay income tax", () => {
    const profile: CitizenProfile = { landHoldingAcres: 2, occupationCategory: "farmer", paysIncomeTax: false };
    expect(evaluateScheme(profile, scheme("pm-kisan")).verdict).toBe("eligible");
  });

  it("is not eligible for a landless applicant", () => {
    const profile: CitizenProfile = { landHoldingAcres: 0, occupationCategory: "farmer", paysIncomeTax: false };
    const result = evaluateScheme(profile, scheme("pm-kisan"));
    expect(result.verdict).toBe("not_eligible");
    expect(result.criteria.find((c) => c.id === "landholding")?.outcome).toBe("not_met");
  });

  it("needs more information when income-tax status is unknown", () => {
    const profile: CitizenProfile = { landHoldingAcres: 2, occupationCategory: "farmer" };
    expect(evaluateScheme(profile, scheme("pm-kisan")).verdict).toBe("more_information_needed");
  });
});

describe("evaluateScheme: ayushman-bharat-pmjay", () => {
  it("is eligible for a BPL ration card holder", () => {
    const profile: CitizenProfile = { rationCardType: "BPL" };
    expect(evaluateScheme(profile, scheme("ayushman-bharat-pmjay")).verdict).toBe("eligible");
  });

  it("is eligible for a 70-plus citizen regardless of ration card", () => {
    const profile: CitizenProfile = { age: 75, rationCardType: "APL" };
    expect(evaluateScheme(profile, scheme("ayushman-bharat-pmjay")).verdict).toBe("eligible");
  });

  it("is not eligible for a working-age APL citizen", () => {
    const profile: CitizenProfile = { age: 30, rationCardType: "APL" };
    expect(evaluateScheme(profile, scheme("ayushman-bharat-pmjay")).verdict).toBe("not_eligible");
  });

  it("needs more information when both age and ration card are unknown", () => {
    const profile: CitizenProfile = {};
    expect(evaluateScheme(profile, scheme("ayushman-bharat-pmjay")).verdict).toBe("more_information_needed");
  });
});

describe("evaluateScheme: pmay-gramin", () => {
  const base: CitizenProfile = {
    ownsPuccaHouse: false,
    rationCardType: "BPL",
    annualHouseholdIncome: 120000,
    isGovernmentEmployeeOrPensioner: false,
    paysIncomeTax: false,
  };

  it("is eligible when every criterion is met", () => {
    expect(evaluateScheme(base, scheme("pmay-gramin")).verdict).toBe("eligible");
  });

  it("is not eligible for someone who already owns a pucca house", () => {
    const profile = { ...base, ownsPuccaHouse: true };
    const result = evaluateScheme(profile, scheme("pmay-gramin"));
    expect(result.verdict).toBe("not_eligible");
    expect(result.criteria.find((c) => c.id === "no-pucca-house")?.outcome).toBe("not_met");
  });

  it("needs more information when ration card status is unknown", () => {
    const profile = { ...base, rationCardType: undefined };
    expect(evaluateScheme(profile, scheme("pmay-gramin")).verdict).toBe("more_information_needed");
  });
});

describe("evaluateScheme: pm-ujjwala", () => {
  it("is eligible for an adult BPL woman", () => {
    const profile: CitizenProfile = { gender: "female", age: 25, rationCardType: "BPL" };
    expect(evaluateScheme(profile, scheme("pm-ujjwala")).verdict).toBe("eligible");
  });

  it("is not eligible for a man", () => {
    const profile: CitizenProfile = { gender: "male", age: 25, rationCardType: "BPL" };
    expect(evaluateScheme(profile, scheme("pm-ujjwala")).verdict).toBe("not_eligible");
  });

  it("needs more information when age is unknown", () => {
    const profile: CitizenProfile = { gender: "female", rationCardType: "BPL" };
    expect(evaluateScheme(profile, scheme("pm-ujjwala")).verdict).toBe("more_information_needed");
  });
});

describe("evaluateScheme: nsap-old-age-pension", () => {
  it("is eligible for a 65-year-old BPL applicant", () => {
    const profile: CitizenProfile = { age: 65, rationCardType: "BPL" };
    expect(evaluateScheme(profile, scheme("nsap-old-age-pension")).verdict).toBe("eligible");
  });

  it("is not eligible under age 60", () => {
    const profile: CitizenProfile = { age: 50, rationCardType: "BPL" };
    expect(evaluateScheme(profile, scheme("nsap-old-age-pension")).verdict).toBe("not_eligible");
  });

  it("needs more information when ration card status is unknown", () => {
    const profile: CitizenProfile = { age: 65 };
    expect(evaluateScheme(profile, scheme("nsap-old-age-pension")).verdict).toBe("more_information_needed");
  });
});

describe("evaluateScheme: sukanya-samriddhi", () => {
  it("is eligible when there is a daughter under 10", () => {
    const profile: CitizenProfile = { hasDaughterUnder10: true };
    expect(evaluateScheme(profile, scheme("sukanya-samriddhi")).verdict).toBe("eligible");
  });

  it("is not eligible when there is no daughter under 10", () => {
    const profile: CitizenProfile = { hasDaughterUnder10: false };
    expect(evaluateScheme(profile, scheme("sukanya-samriddhi")).verdict).toBe("not_eligible");
  });

  it("needs more information when unanswered", () => {
    const profile: CitizenProfile = {};
    expect(evaluateScheme(profile, scheme("sukanya-samriddhi")).verdict).toBe("more_information_needed");
  });
});

describe("evaluateScheme: pm-vishwakarma", () => {
  it("is eligible for an adult artisan", () => {
    const profile: CitizenProfile = { age: 30, occupationCategory: "artisan_or_craftsperson" };
    expect(evaluateScheme(profile, scheme("pm-vishwakarma")).verdict).toBe("eligible");
  });

  it("is not eligible for a minor, even if in a listed trade", () => {
    const profile: CitizenProfile = { age: 16, occupationCategory: "artisan_or_craftsperson" };
    expect(evaluateScheme(profile, scheme("pm-vishwakarma")).verdict).toBe("not_eligible");
  });

  it("needs more information when occupation category is unknown", () => {
    const profile: CitizenProfile = { age: 30 };
    expect(evaluateScheme(profile, scheme("pm-vishwakarma")).verdict).toBe("more_information_needed");
  });
});

describe("evaluateScheme: mmlby-maharashtra", () => {
  const base: CitizenProfile = { gender: "female", age: 30, state: "Maharashtra", annualHouseholdIncome: 200000 };

  it("is eligible when every criterion is met", () => {
    expect(evaluateScheme(base, scheme("mmlby-maharashtra")).verdict).toBe("eligible");
  });

  it("is not eligible for a resident of a different state", () => {
    const profile = { ...base, state: "Gujarat" };
    const result = evaluateScheme(profile, scheme("mmlby-maharashtra"));
    expect(result.verdict).toBe("not_eligible");
    expect(result.criteria.find((c) => c.id === "maharashtra-resident")?.outcome).toBe("not_met");
  });

  it("needs more information when household income is unknown", () => {
    const profile = { ...base, annualHouseholdIncome: undefined };
    expect(evaluateScheme(profile, scheme("mmlby-maharashtra")).verdict).toBe("more_information_needed");
  });
});

describe("SCHEMES catalogue integrity", () => {
  it("every scheme has a non-empty sourceUrl and a verifiedOn date", () => {
    for (const s of SCHEMES) {
      expect(s.sourceUrl, `${s.id} has no sourceUrl`).toMatch(/^https:\/\//);
      expect(s.verifiedOn, `${s.id} has no verifiedOn date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("no two schemes share an id", () => {
    const ids = SCHEMES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("at least one scheme is state-jurisdiction, distinct from the rest", () => {
    expect(SCHEMES.some((s) => s.jurisdiction === "state")).toBe(true);
  });
});
