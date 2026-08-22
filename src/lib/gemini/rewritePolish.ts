// A second, optional phrasing pass over a rewrite the deterministic
// linter already decided on. The rule engine in src/lib/linter/rules.ts
// is what decided the question needed rewriting and produced the first,
// safe, mechanical rewrite; this function is only ever allowed to make
// that same rewrite read more naturally. It is explicitly told the
// meaning it must preserve, and its output is offered as a second
// choice next to the deterministic one, never as a replacement an
// operator has not seen and chosen.

import { getGeminiClient, getGeminiModelId, isGeminiConfigured } from "@/lib/gemini/client";

const SYSTEM_INSTRUCTION = `You rephrase a single Right to Information application question so it reads naturally, without changing what is being asked for.

Rules you must follow exactly:
1. The rewritten question must ask for the exact same record or document as the mechanical rewrite you are given. Do not broaden it, narrow it, or ask for anything additional.
2. Do not add a reason, an opinion, or a "why" framing. The whole point of the original rewrite was to remove exactly that.
3. Keep it to one sentence, formal but readable, suitable to appear in a government filing.
4. Output only the rewritten question. No preamble, no quotation marks, no explanation.`;

export async function polishRewrite(originalQuestion: string, mechanicalRewrite: string): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const ai = getGeminiClient();
  const model = getGeminiModelId();

  const prompt = `Original, non-compliant question: ${originalQuestion}

Mechanical rewrite produced by the rule engine (this is the meaning and scope you must preserve exactly): ${mechanicalRewrite}

Produce a more naturally phrased version of the mechanical rewrite now.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.3,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }
  return text;
}
