// Plain-language translation for the citizen. This is a phrasing task,
// not a legal one: the model is told exactly what it may not do (change
// what is being asked for, add a claim, drop a claim, guess at law) and
// is asked only to say the same thing in the applicant's language, at a
// reading level a layperson can follow without training. The output is
// always shown with the formal English original beside it and a visible
// note that it is machine-translated and should be checked before it is
// handed to the citizen, never treated as the filing itself.

import { getGeminiClient, getGeminiModelId, isGeminiConfigured } from "@/lib/gemini/client";
import type { CaseRecord } from "@/lib/types";

export interface PlainLanguageResult {
  language: string;
  text: string;
  model: string;
  generatedAt: string;
}

const SYSTEM_INSTRUCTION = `You translate formal Right to Information applications into plain, everyday language for the citizen who asked for them, in the language requested.

Rules you must follow exactly:
1. Preserve every question and every fact exactly. Do not add a question, drop a question, or change what is being asked for.
2. Do not offer legal advice, predict an outcome, or state whether the request will succeed.
3. Do not invent section numbers, deadlines, or authority names that were not given to you.
4. Write at a reading level a person with no legal background and modest formal education can follow.
5. Output only the translated plain-language text. No preamble, no markdown, no explanation of what you did.`;

export async function generatePlainLanguageCopy(
  caseRecord: CaseRecord
): Promise<PlainLanguageResult> {
  if (!isGeminiConfigured()) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const ai = getGeminiClient();
  const model = getGeminiModelId();

  const questionsBlock = caseRecord.questions
    .map((q, i) => `${i + 1}. ${q.text}`)
    .join("\n");

  const prompt = `Applicant's grievance, in their own words: ${caseRecord.grievanceRaw}

Formal questions filed in the Right to Information application:
${questionsBlock || "(no questions drafted yet)"}

Target language for the plain-language copy: ${caseRecord.applicant.preferredLanguage || "English"}

Write the plain-language copy now, in the target language.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return {
    language: caseRecord.applicant.preferredLanguage || "English",
    text,
    model,
    generatedAt: new Date().toISOString(),
  };
}
