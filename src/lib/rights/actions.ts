"use server";

// Deliberately not gated by requireSession(): the Rights Navigator is
// public, the same way the landing page is, so a judge (or any
// citizen) can see it work before deciding to sign in. Retrieval is
// pure and free; the only cost here is the optional Gemini call, which
// is already rate-limited by nothing more than ordinary demo traffic,
// same posture as the rest of the AI layer in this app.

import { buildRightsAnswer } from "@/lib/rights/answer";
import type { RightsAnswer } from "@/lib/rights/answer";

export async function askRightsAction(question: string): Promise<RightsAnswer> {
  const trimmed = question.trim();
  if (!trimmed) {
    return { status: "no_source", question: trimmed, chunks: [], coveredTopics: [] };
  }
  return buildRightsAnswer(trimmed);
}
