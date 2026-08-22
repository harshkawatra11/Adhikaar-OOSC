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

const DEFAULT_MODEL = "gemini-2.5-flash";

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getGeminiModelId(): string {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
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
