// The one and only place a model gets instantiated. Everything that
// calls Gemini in this codebase goes through here, and every caller is
// one of the two things the methodology page says a model is allowed to
// do: propose a rewrite, or phrase a translation. Nothing here decides
// jurisdiction, lints a question, computes a deadline, or renders a
// legal citation; those stay in src/lib as plain, offline, testable code.
//
// If no key is configured, callers get a typed, expected failure rather
// than a crash, and the rest of the product keeps working exactly as it
// did before this file existed. Adhikaar was built and fully tested
// without a Gemini key; this layer is additive, not load-bearing.

import { GoogleGenAI } from "@google/genai";

// gemini-3.7-flash is tried first. gemini-3.6-flash is the second entry
// because it is what Google's own API error names as the replacement
// once a model is retired for new API keys, a message this integration
// actually received while wiring this in: gemini-2.5-flash, the model
// this integration ran on and was fully tested against for the rest of
// this project, turned out to already be closed to new users by the
// time a real key was tested against it. It stays in the chain third,
// for older keys that still have access, rather than being removed,
// since removing it would only reintroduce the exact single-model
// fragility this chain exists to avoid. An explicit GEMINI_MODEL env
// var is tried before all three, never in place of the chain, so a
// misconfigured or since-renamed override cannot take the two AI
// features down entirely.
const BUILT_IN_MODEL_CHAIN = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-2.5-flash"];

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getGeminiModelChain(): string[] {
  const chain = process.env.GEMINI_MODEL
    ? [process.env.GEMINI_MODEL, ...BUILT_IN_MODEL_CHAIN]
    : BUILT_IN_MODEL_CHAIN;
  return [...new Set(chain)];
}

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new GeminiNotConfiguredError();
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

export class GeminiNotConfiguredError extends Error {
  constructor() {
    super(
      "GEMINI_API_KEY is not set. Add it to .env.local (see .env.example) to enable AI-assisted translation and rewrite phrasing. Every other feature of Adhikaar works without it."
    );
    this.name = "GeminiNotConfiguredError";
  }
}

export class GeminiAllModelsFailedError extends Error {
  constructor(triedModels: string[], causes: unknown[]) {
    const lastCause = causes[causes.length - 1];
    const lastMessage = lastCause instanceof Error ? lastCause.message : String(lastCause);
    super(
      `Every model in the fallback chain failed (tried: ${triedModels.join(", ")}). Last error: ${lastMessage}`
    );
    this.name = "GeminiAllModelsFailedError";
  }
}

export interface GenerateWithFallbackParams {
  contents: string;
  systemInstruction: string;
  temperature: number;
}

export interface GenerateWithFallbackResult {
  text: string;
  modelUsed: string;
}

/** Tries each model in getGeminiModelChain() in order, moving to the
 *  next on any request-level failure (unknown model, model not enabled
 *  for this key, transient API error). Every caller in this codebase
 *  goes through this instead of calling ai.models.generateContent
 *  directly, so a model rename or an access gap degrades a feature
 *  instead of breaking it. */
export async function generateWithFallback(
  params: GenerateWithFallbackParams
): Promise<GenerateWithFallbackResult> {
  const ai = getGeminiClient();
  const chain = getGeminiModelChain();
  const causes: unknown[] = [];

  for (const model of chain) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          temperature: params.temperature,
        },
      });
      const text = response.text?.trim();
      if (!text) {
        throw new Error(`Model "${model}" returned an empty response.`);
      }
      return { text, modelUsed: model };
    } catch (err) {
      causes.push(err);
    }
  }

  throw new GeminiAllModelsFailedError(chain, causes);
}
