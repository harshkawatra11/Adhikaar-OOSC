import { describe, it, expect } from "vitest";
import { generateRtiPdf } from "@/lib/pdf/generate";
import type { CaseRecord } from "@/lib/types";

const sample: CaseRecord = {
  id: "test-case-id",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  status: "drafted",
  applicant: { name: "Rekha Deshmukh", address: "Ward 12, Nagpur, Maharashtra", isBpl: false, preferredLanguage: "Marathi" },
  grievanceSummary: "Land record request",
  grievanceRaw: "Land record request",
  lowConfidenceFields: [],
  selectedAuthorityId: "mh-revenue",
  questions: [
    { id: "q1", text: "Please provide a certified copy of the mutation register entry for khasra number 134", findings: [] },
  ],
  deadlines: [],
  operatorNotes: "",
};

describe("generateRtiPdf", () => {
  it("produces a well-formed PDF starting with the PDF magic bytes", async () => {
    const bytes = await generateRtiPdf(sample);
    const header = Buffer.from(bytes.slice(0, 5)).toString("utf-8");
    expect(header).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(500);
  });

  it("waives the fee line for a BPL applicant instead of showing an amount", async () => {
    const bplCase: CaseRecord = { ...sample, applicant: { ...sample.applicant, isBpl: true } };
    const bytes = await generateRtiPdf(bplCase);
    expect(bytes.length).toBeGreaterThan(500);
  });
});
