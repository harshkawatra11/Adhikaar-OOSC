import { describe, it, expect } from "vitest";
import { resolveCitation, tryResolveCitation, UnresolvedCitationError } from "@/lib/citations";
import { RTI_ACT_CORPUS } from "@/lib/data/rti-act";
import { RIGHTS_CORPUS } from "@/lib/data/rights-corpus";
import { ALL_CORPUS } from "@/lib/data/corpus";

describe("the citation render gate", () => {
  it("resolves a real RTI Act citation id to its corpus text", () => {
    const chunk = resolveCitation("rti-7-1");
    expect(chunk.section).toBe("7(1)");
    expect(chunk.text).toMatch(/thirty days/);
  });

  it("resolves a real rights-corpus citation id too, through the merged corpus", () => {
    const chunk = resolveCitation("const-art-21");
    expect(chunk.act).toBe("Constitution of India");
    expect(chunk.text).toMatch(/personal liberty/);
  });

  it("throws, rather than rendering silently, on an unknown id", () => {
    expect(() => resolveCitation("rti-does-not-exist")).toThrow(UnresolvedCitationError);
  });

  it("tryResolveCitation returns null instead of throwing", () => {
    expect(tryResolveCitation("rti-does-not-exist")).toBeNull();
  });

  it("every corpus entry, across both corpora, has non-empty verbatim text and a source url", () => {
    for (const chunk of ALL_CORPUS) {
      expect(chunk.text.length, `${chunk.id} has empty text`).toBeGreaterThan(20);
      expect(chunk.sourceUrl, `${chunk.id} has no source`).toMatch(/^https:\/\//);
    }
  });

  it("no two entries share an id within the RTI Act corpus", () => {
    const ids = RTI_ACT_CORPUS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no two entries share an id within the rights corpus", () => {
    const ids = RIGHTS_CORPUS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no id collides across the two corpora once merged: a duplicate would silently shadow one entry", () => {
    const ids = ALL_CORPUS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
