import { describe, it, expect } from "vitest";
import { runRemedyTriage } from "@/lib/remedy";

describe("runRemedyTriage", () => {
  it("treats a plain records request as an ordinary RTI case", () => {
    const r = runRemedyTriage("Please provide a copy of the sanctioned building plan for this site");
    expect(r.remedyClass).toBe("rti");
    expect(r.outOfCoverage).toBe(false);
  });

  it("routes a refund grievance to consumer forum instead of drafting an RTI", () => {
    const r = runRemedyTriage("The seller delivered a defective product and refused a refund of Rs. 25,000");
    expect(r.remedyClass).toBe("consumer");
    expect(r.forumName).toMatch(/e-Daakhil/);
    expect(r.pecuniaryJurisdiction?.level).toBe("District");
  });

  it("computes State pecuniary jurisdiction for a larger consumer amount", () => {
    const r = runRemedyTriage("The builder delayed possession and the flat cost Rs. 75,00,000 was paid");
    expect(r.pecuniaryJurisdiction?.level).toBe("State");
  });

  it("computes National pecuniary jurisdiction for a very large consumer amount", () => {
    const r = runRemedyTriage("The insurance claim denied on our project was worth Rs. 3,00,00,000");
    expect(r.pecuniaryJurisdiction?.level).toBe("National");
  });

  it("routes a wage dispute to the labour forum, not RTI", () => {
    const r = runRemedyTriage("My employer terminated me without notice and has not paid my salary not paid for two months");
    expect(r.remedyClass).toBe("labour");
  });

  it("declares a tenancy dispute out of coverage rather than guessing a forum", () => {
    const r = runRemedyTriage("My landlord is not returning my security deposit not returned after I vacated");
    expect(r.remedyClass).toBe("tenancy");
    expect(r.outOfCoverage).toBe(true);
  });

  it("recognises a hybrid case: a record needed to support a substantive claim", () => {
    const r = runRemedyTriage(
      "I want a copy of the builder's sanctioned plan because the builder delayed possession and refuses a refund"
    );
    expect(r.remedyClass).toBe("hybrid");
    expect(r.guidanceNote).toMatch(/does not use it to seek the relief|for the record only/i);
  });
});
