import { describe, it, expect } from "vitest";
import { retrieve, isConfidentMatch, RETRIEVAL_FLOOR } from "@/lib/rights/retrieve";
import { getCorpusChunk } from "@/lib/data/corpus";

describe("retrieve: in-corpus questions rank the right chunk first", () => {
  const cases: Array<{ query: string; expectedTopId: string }> = [
    { query: "my landlord is keeping my security deposit after I moved out", expectedTopId: "mta-security-deposit" },
    { query: "what is the limitation period to file a consumer complaint", expectedTopId: "cpa-69" },
    { query: "how many days does the public information officer have to reply to my RTI", expectedTopId: "rti-7-1" },
    { query: "my employer fired me without giving notice or compensation", expectedTopId: "ida-retrenchment-notice" },
    { query: "which High Court can issue a writ petition against the government", expectedTopId: "const-art-226" },
  ];

  for (const { query, expectedTopId } of cases) {
    it(`"${query}" -> ${expectedTopId}`, () => {
      const results = retrieve(query);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].chunk.id).toBe(expectedTopId);
      expect(isConfidentMatch(results)).toBe(true);
    });
  }
});

describe("retrieve: off-corpus questions fall below the confidence floor", () => {
  const offCorpusQueries = [
    "how do I get a divorce from my spouse",
    "what is the capital of France",
    "how do I register a private limited company",
  ];

  for (const query of offCorpusQueries) {
    it(`"${query}" is not answered confidently`, () => {
      const results = retrieve(query);
      expect(isConfidentMatch(results)).toBe(false);
    });
  }
});

describe("retrieve: sanity checks on the mechanism itself", () => {
  it("RETRIEVAL_FLOOR is exported and sits strictly between 0 and 1", () => {
    expect(RETRIEVAL_FLOOR).toBeGreaterThan(0);
    expect(RETRIEVAL_FLOOR).toBeLessThan(1);
  });

  it("every returned chunk id resolves through the merged corpus", () => {
    const results = retrieve("my landlord will not return my security deposit");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(getCorpusChunk(r.chunk.id)).toBeDefined();
    }
  });

  it("returns an empty array for an empty or whitespace-only query", () => {
    expect(retrieve("")).toEqual([]);
    expect(retrieve("   ")).toEqual([]);
  });

  it("returns at most five results, sorted by descending score", () => {
    const results = retrieve("information application section act government");
    expect(results.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});
