import { describe, it, expect } from "vitest";
import { resolveCitation, tryResolveCitation, UnresolvedCitationError } from "@/lib/citations";
import { RTI_ACT_CORPUS } from "@/lib/data/rti-act";

describe("the citation render gate", () => {
  it("resolves a real citation id to its corpus text", () => {
    const chunk = resolveCitation("rti-7-1");
    expect(chunk.section).toBe("7(1)");
    expect(chunk.text).toMatch(/thirty days/);
  });

  it("throws, rather than rendering silently, on an unknown id", () => {
    expect(() => resolveCitation("rti-does-not-exist")).toThrow(UnresolvedCitationError);
  });

  it("tryResolveCitation returns null instead of throwing", () => {
    expect(tryResolveCitation("rti-does-not-exist")).toBeNull();
  });

  it("every corpus entry has a non-empty verbatim text and a source url", () => {
    for (const chunk of RTI_ACT_CORPUS) {
      expect(chunk.text.length, `${chunk.id} has empty text`).toBeGreaterThan(20);
      expect(chunk.sourceUrl, `${chunk.id} has no source`).toMatch(/^https:\/\//);
    }
  });

  it("no two corpus entries share an id", () => {
    const ids = RTI_ACT_CORPUS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
