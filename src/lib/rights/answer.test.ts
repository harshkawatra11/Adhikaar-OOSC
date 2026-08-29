import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildRightsAnswer, rightsAnswerBoundaryLine } from "@/lib/rights/answer";

describe("buildRightsAnswer: declines rather than guessing", () => {
  it("returns no_source with no chunks for an off-corpus question", async () => {
    const answer = await buildRightsAnswer("how do I get a divorce from my spouse");
    expect(answer.status).toBe("no_source");
    expect(answer.chunks).toHaveLength(0);
    expect(answer.coveredTopics.length).toBeGreaterThan(0);
  });
});

describe("buildRightsAnswer: works fully without GEMINI_API_KEY", () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  });

  it("answers from the chunks alone, with no plainLanguage field, and does not throw", async () => {
    const answer = await buildRightsAnswer("my landlord will not return my security deposit");
    expect(answer.status).toBe("answered");
    expect(answer.chunks.length).toBeGreaterThan(0);
    expect(answer.plainLanguage).toBeUndefined();
  });
});

describe("rightsAnswerBoundaryLine", () => {
  it("never phrases as a directive", () => {
    const line = rightsAnswerBoundaryLine();
    expect(line.toLowerCase()).not.toMatch(/you should sue|you will win/);
    expect(line).toMatch(/not advice/i);
  });
});
