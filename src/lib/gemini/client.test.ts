import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

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
        ownerUid: "test-owner",
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

describe("getGeminiModelChain", () => {
  afterEach(() => {
    delete process.env.GEMINI_MODEL;
  });

  it("defaults to gemini-3.7-flash first, gemini-2.5-flash as the fallback", async () => {
    delete process.env.GEMINI_MODEL;
    const { getGeminiModelChain } = await import("@/lib/gemini/client");
    expect(getGeminiModelChain()).toEqual(["gemini-3.7-flash", "gemini-3.6-flash", "gemini-2.5-flash"]);
  });

  it("tries an explicit GEMINI_MODEL override first, ahead of the built-in chain", async () => {
    process.env.GEMINI_MODEL = "gemini-experimental-preview";
    const { getGeminiModelChain } = await import("@/lib/gemini/client");
    expect(getGeminiModelChain()).toEqual([
      "gemini-experimental-preview",
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-2.5-flash",
    ]);
  });

  it("does not duplicate an override that already matches a built-in model", async () => {
    process.env.GEMINI_MODEL = "gemini-3.7-flash";
    const { getGeminiModelChain } = await import("@/lib/gemini/client");
    expect(getGeminiModelChain()).toEqual(["gemini-3.7-flash", "gemini-3.6-flash", "gemini-2.5-flash"]);
  });
});

const { mockGenerateContent } = vi.hoisted(() => ({ mockGenerateContent: vi.fn() }));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: mockGenerateContent };
  },
}));

describe("generateWithFallback", () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.resetModules();
    mockGenerateContent.mockReset();
    process.env.GEMINI_API_KEY = "test-key";
  });

  afterEach(() => {
    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  it("uses the first model in the chain when it succeeds", async () => {
    mockGenerateContent.mockResolvedValue({ text: "  translated text  " });

    const { generateWithFallback } = await import("@/lib/gemini/client");
    const result = await generateWithFallback({
      contents: "hello",
      systemInstruction: "translate",
      temperature: 0.2,
    });

    expect(result.modelUsed).toBe("gemini-3.7-flash");
    expect(result.text).toBe("translated text");
  });

  it("falls back to gemini-3.6-flash when gemini-3.7-flash fails", async () => {
    mockGenerateContent.mockImplementation(({ model }: { model: string }) => {
      if (model === "gemini-3.7-flash") {
        return Promise.reject(new Error("model not found for this API key"));
      }
      return Promise.resolve({ text: "fallback response" });
    });

    const { generateWithFallback } = await import("@/lib/gemini/client");
    const result = await generateWithFallback({
      contents: "hello",
      systemInstruction: "translate",
      temperature: 0.2,
    });

    expect(result.modelUsed).toBe("gemini-3.6-flash");
    expect(result.text).toBe("fallback response");
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("falls back all the way to gemini-2.5-flash when both newer models fail", async () => {
    mockGenerateContent.mockImplementation(({ model }: { model: string }) => {
      if (model === "gemini-3.7-flash" || model === "gemini-3.6-flash") {
        return Promise.reject(new Error("model not found for this API key"));
      }
      return Promise.resolve({ text: "oldest fallback response" });
    });

    const { generateWithFallback } = await import("@/lib/gemini/client");
    const result = await generateWithFallback({
      contents: "hello",
      systemInstruction: "translate",
      temperature: 0.2,
    });

    expect(result.modelUsed).toBe("gemini-2.5-flash");
    expect(result.text).toBe("oldest fallback response");
    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
  });

  it("throws GeminiAllModelsFailedError naming every model tried, when all fail", async () => {
    mockGenerateContent.mockRejectedValue(new Error("quota exceeded"));

    const { generateWithFallback, GeminiAllModelsFailedError } = await import("@/lib/gemini/client");
    await expect(
      generateWithFallback({ contents: "hello", systemInstruction: "translate", temperature: 0.2 })
    ).rejects.toThrow(GeminiAllModelsFailedError);
    await expect(
      generateWithFallback({ contents: "hello", systemInstruction: "translate", temperature: 0.2 })
    ).rejects.toThrow(/gemini-3\.7-flash.*gemini-3\.6-flash.*gemini-2\.5-flash/);
  });

  it("treats an empty response from a model as a failure and moves to the next one", async () => {
    mockGenerateContent.mockImplementation(({ model }: { model: string }) => {
      if (model === "gemini-3.7-flash") {
        return Promise.resolve({ text: "   " });
      }
      return Promise.resolve({ text: "real answer" });
    });

    const { generateWithFallback } = await import("@/lib/gemini/client");
    const result = await generateWithFallback({
      contents: "hello",
      systemInstruction: "translate",
      temperature: 0.2,
    });

    expect(result.modelUsed).toBe("gemini-3.6-flash");
    expect(result.text).toBe("real answer");
  });
});
