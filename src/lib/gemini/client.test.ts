import { describe, it, expect, beforeEach, afterEach } from "vitest";

// isGeminiConfigured and getGeminiClient must fail predictably, not
// crash the caller, when no key is set. Both callers in actions.ts rely
// on exactly this to show a clean inline error instead of a 500.

describe("Gemini client, without a configured key", () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  });

  it("reports itself as not configured", async () => {
    const { isGeminiConfigured } = await import("@/lib/gemini/client");
    expect(isGeminiConfigured()).toBe(false);
  });

  it("throws a typed, descriptive error rather than an opaque SDK failure", async () => {
    const { getGeminiClient, GeminiNotConfiguredError } = await import("@/lib/gemini/client");
    expect(() => getGeminiClient()).toThrow(GeminiNotConfiguredError);
    expect(() => getGeminiClient()).toThrow(/GEMINI_API_KEY/);
  });

  it("generatePlainLanguageCopy rejects cleanly instead of calling the network", async () => {
    const { generatePlainLanguageCopy } = await import("@/lib/gemini/translate");
    await expect(
      generatePlainLanguageCopy({
        id: "x",
        createdAt: "",
        updatedAt: "",
        status: "drafted",
        applicant: { name: "x", address: "x", isBpl: false, preferredLanguage: "Hindi" },
        grievanceSummary: "x",
        grievanceRaw: "x",
        lowConfidenceFields: [],
        questions: [],
        deadlines: [],
        operatorNotes: "",
      })
    ).rejects.toThrow();
  });

  it("polishRewrite rejects cleanly instead of calling the network", async () => {
    const { polishRewrite } = await import("@/lib/gemini/rewritePolish");
    await expect(polishRewrite("Why was this rejected", "Please provide a certified copy")).rejects.toThrow();
  });
});

describe("model id resolution", () => {
  it("defaults to gemini-2.5-flash when GEMINI_MODEL is unset", async () => {
    delete process.env.GEMINI_MODEL;
    const { getGeminiModelId } = await import("@/lib/gemini/client");
    expect(getGeminiModelId()).toBe("gemini-2.5-flash");
  });

  it("honours an explicit GEMINI_MODEL override", async () => {
    process.env.GEMINI_MODEL = "gemini-3.7-flash";
    const { getGeminiModelId } = await import("@/lib/gemini/client");
    expect(getGeminiModelId()).toBe("gemini-3.7-flash");
    delete process.env.GEMINI_MODEL;
  });
});
