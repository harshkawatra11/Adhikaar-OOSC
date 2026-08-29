// Builds a Rights Navigator answer from retrieved corpus chunks. The
// chunks are the answer; this module's only job when a model is
// available is to explain them in plain language, adding no fact not
// present in them, exactly the same boundary translate.ts already
// holds for plain-language RTI copy. Without a key, the chunks and
// their `note` fields are the whole answer, a worse read but a
// correct one, never a missing one.

import { generateWithFallback, isGeminiConfigured } from "@/lib/gemini/client";
import { retrieve, isConfidentMatch, RETRIEVAL_FLOOR } from "@/lib/rights/retrieve";
import type { CorpusChunk } from "@/lib/types";

export interface RightsAnswer {
  status: "answered" | "no_source";
  question: string;
  chunks: CorpusChunk[];
  /** Present only when Gemini phrased an explanation. Always rendered
   *  beside the chunks, never instead of them. */
  plainLanguage?: { text: string; model: string };
  /** Topics the corpus does cover, shown when status is "no_source" so
   *  a decline is not a dead end. */
  coveredTopics: string[];
}

const BOUNDARY_LINE =
  "This explains what the law says. It is not advice about your specific situation, and for that you need a lawyer or a legal aid clinic.";

const COVERED_TOPICS = [
  "the RTI Act's own provisions (already covered in detail elsewhere in Adhikaar)",
  "the Constitution: equality, free speech, personal liberty, writ remedies, the right to property",
  "consumer disputes: who counts as a consumer, deficiency in service, jurisdiction, limitation",
  "tenancy: security deposits, the Rent Authority, notice periods (where a state has adopted the Model Tenancy Act)",
  "wages and dismissal: timely payment, retrenchment notice, the Labour Court",
];

const SYSTEM_INSTRUCTION = `You explain Indian statutory text in plain, everyday language for a citizen who asked a rights question, given only the exact statutory chunks provided to you.

Rules you must follow exactly:
1. Use only the facts stated in the chunks you are given. Do not add a fact, a number, a deadline, or a claim not present in them.
2. Do not offer legal advice, predict an outcome, or tell the citizen what to do next beyond what the chunks themselves state.
3. Never say "you should sue", "you will win", or any other directive framing. Explain what the law says; do not instruct.
4. If the chunks disagree or one is marked as unverified in its own note, say so plainly rather than picking one silently.
5. Write at a reading level a person with no legal background can follow, in two to four sentences.
6. Output only the explanation text. No preamble, no markdown, no repetition of the boundary line, which is added separately.`;

/** Pure over its inputs except for the optional Gemini call, which is
 *  the only I/O here. Retrieval itself (retrieve.ts) is fully
 *  deterministic and already tested in isolation. */
export async function buildRightsAnswer(question: string): Promise<RightsAnswer> {
  const results = retrieve(question);

  if (!isConfidentMatch(results)) {
    return {
      status: "no_source",
      question,
      chunks: [],
      coveredTopics: COVERED_TOPICS,
    };
  }

  const chunks = results
    .filter((r) => r.score >= RETRIEVAL_FLOOR * 0.6)
    .slice(0, 3)
    .map((r) => r.chunk);

  const answer: RightsAnswer = {
    status: "answered",
    question,
    chunks,
    coveredTopics: COVERED_TOPICS,
  };

  if (!isGeminiConfigured()) {
    return answer;
  }

  try {
    const contextBlock = chunks
      .map((c) => `${c.act}, ${c.section} (${c.heading}): "${c.text}"${c.note ? ` Note: ${c.note}` : ""}`)
      .join("\n\n");
    const prompt = `Citizen's question: ${question}\n\nRelevant statutory text:\n${contextBlock}\n\nExplain this in plain language now.`;

    const { text, modelUsed } = await generateWithFallback({
      contents: prompt,
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
    });

    answer.plainLanguage = { text, model: modelUsed };
  } catch {
    // Gemini being unavailable is not a failure of this feature: the
    // chunks and their notes are still a complete, correct answer.
  }

  return answer;
}

export function rightsAnswerBoundaryLine(): string {
  return BOUNDARY_LINE;
}
