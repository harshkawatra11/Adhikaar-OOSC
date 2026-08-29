"use server";

import { revalidatePath } from "next/cache";
import { createCase, getCase, updateCase } from "@/lib/store";
import { requireSession } from "@/lib/auth/session";
import { runJurisdictionTriage } from "@/lib/jurisdiction";
import { runRemedyTriage } from "@/lib/remedy";
import { lintQuestion } from "@/lib/linter/rules";
import { computeInitialDeadlines } from "@/lib/deadlines";
import { sweepCase } from "@/lib/sweep";
import { buildSweepPatch } from "@/lib/sweepPatch";
import { generatePlainLanguageCopy } from "@/lib/gemini/translate";
import { polishRewrite } from "@/lib/gemini/rewritePolish";
import type { DraftQuestion } from "@/lib/types";
import { randomUUID } from "crypto";

export interface CreateFilingInput {
  grievanceRaw: string;
  name: string;
  address: string;
  state: string;
  isBpl: boolean;
  preferredLanguage: string;
  /** Already chosen by the citizen inside the interview (WP4), from
   *  the candidates the jurisdiction engine offered. */
  authorityId?: string;
  /** Question text the citizen drafted and reviewed inside the
   *  interview, already lint-checked client-side; re-linted here too,
   *  since the server is the one place a finding is allowed to be
   *  authoritative. */
  questions?: string[];
}

/** Creates a filing in one write, with jurisdiction, remedy, the
 *  chosen authority and the drafted questions already resolved, rather
 *  than the citizen landing on an empty case and filling each of those
 *  in separately. Used by the guided interview (src/components/
 *  interview/Interview.tsx) instead of a raw FormData submit, so it
 *  takes a plain object and returns the new id rather than redirecting
 *  itself: the interview owns the moment it navigates away. */
export async function createFilingAction(input: CreateFilingInput): Promise<{ id: string }> {
  const { uid } = await requireSession();

  const grievanceRaw = input.grievanceRaw.trim();
  const name = input.name.trim();
  const address = input.address.trim();
  const state = input.state.trim();

  const jurisdiction = runJurisdictionTriage({
    grievanceText: grievanceRaw,
    state,
    selectedAuthorityId: input.authorityId,
  });
  const remedy = runRemedyTriage(grievanceRaw);

  const lowConfidenceFields: string[] = [];
  if (!name) lowConfidenceFields.push("applicant.name");
  if (!address) lowConfidenceFields.push("applicant.address");
  // Only flag a missing state for a subject where one is actually
  // needed. A Union subject is answered by a Central office regardless
  // of which state the applicant lives in, so the interview never asks
  // for one on that path, and flagging it there would tell a citizen
  // something is missing when nothing is.
  if (!state && jurisdiction.scheduleList !== "Union") lowConfidenceFields.push("geography.state");

  const questions: DraftQuestion[] = (input.questions ?? [])
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ id: randomUUID(), text, findings: lintQuestion(text) }));

  const record = await createCase({
    ownerUid: uid,
    status: questions.length ? "drafted" : "triaged",
    applicant: { name, address, isBpl: input.isBpl, preferredLanguage: input.preferredLanguage },
    grievanceSummary: grievanceRaw.slice(0, 220),
    grievanceRaw,
    lowConfidenceFields,
    jurisdiction,
    remedy,
    selectedAuthorityId: input.authorityId,
    questions,
    deadlines: [],
    operatorNotes: "",
  });

  revalidatePath("/my");
  return { id: record.id };
}

export async function selectAuthorityAction(caseId: string, authorityId: string): Promise<void> {
  const { uid } = await requireSession();
  const current = await getCase(caseId, uid);
  if (!current) return;

  const jurisdiction = runJurisdictionTriage({
    grievanceText: current.grievanceRaw,
    state: current.jurisdiction?.candidates.find((c) => c.authorityId === authorityId)?.state,
    selectedAuthorityId: authorityId,
  });

  await updateCase(caseId, uid, { selectedAuthorityId: authorityId, jurisdiction });
  revalidatePath(`/my/${caseId}`);
}

export async function addQuestionAction(caseId: string, formData: FormData): Promise<void> {
  const { uid } = await requireSession();
  const text = String(formData.get("question") ?? "").trim();
  if (!text) return;
  const current = await getCase(caseId, uid);
  if (!current) return;

  const findings = lintQuestion(text);
  const question: DraftQuestion = { id: randomUUID(), text, findings };

  await updateCase(caseId, uid, {
    questions: [...current.questions, question],
    status: current.status === "triaged" ? "drafted" : current.status,
  });
  revalidatePath(`/my/${caseId}`);
}

export async function removeQuestionAction(caseId: string, questionId: string): Promise<void> {
  const { uid } = await requireSession();
  const current = await getCase(caseId, uid);
  if (!current) return;
  await updateCase(caseId, uid, {
    questions: current.questions.filter((q) => q.id !== questionId),
  });
  revalidatePath(`/my/${caseId}`);
}

export async function acceptRewriteAction(
  caseId: string,
  questionId: string,
  variant: "mechanical" | "ai" = "mechanical"
): Promise<void> {
  const { uid } = await requireSession();
  const current = await getCase(caseId, uid);
  if (!current) return;

  const questions = current.questions.map((q) => {
    if (q.id !== questionId) return q;
    const finding = q.findings.find((f) => f.suggestedRewrite);
    const rewrite = variant === "ai" ? finding?.aiPhrasedRewrite : finding?.suggestedRewrite;
    if (!rewrite) return q;
    const newFindings = lintQuestion(rewrite);
    return { ...q, originalText: q.originalText ?? q.text, text: rewrite, findings: newFindings };
  });

  await updateCase(caseId, uid, { questions });
  revalidatePath(`/my/${caseId}`);
}

export async function polishRewriteAction(
  caseId: string,
  questionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { uid } = await requireSession();
  const current = await getCase(caseId, uid);
  if (!current) return { ok: false, error: "Case not found." };

  const question = current.questions.find((q) => q.id === questionId);
  const finding = question?.findings.find((f) => f.suggestedRewrite);
  if (!question || !finding?.suggestedRewrite) {
    return { ok: false, error: "No mechanical rewrite to polish." };
  }

  try {
    const polished = await polishRewrite(question.originalText ?? question.text, finding.suggestedRewrite);
    const questions = current.questions.map((q) =>
      q.id !== questionId
        ? q
        : {
            ...q,
            findings: q.findings.map((f) =>
              f.ruleId === finding.ruleId ? { ...f, aiPhrasedRewrite: polished } : f
            ),
          }
    );
    await updateCase(caseId, uid, { questions });
    revalidatePath(`/my/${caseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error." };
  }
}

export async function generatePlainLanguageCopyAction(
  caseId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { uid } = await requireSession();
  const current = await getCase(caseId, uid);
  if (!current) return { ok: false, error: "Case not found." };

  try {
    const result = await generatePlainLanguageCopy(current);
    await updateCase(caseId, uid, { plainLanguageCopy: result });
    revalidatePath(`/my/${caseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error." };
  }
}

export async function markFiledAction(caseId: string, formData: FormData): Promise<void> {
  const { uid } = await requireSession();
  const filedDate = String(formData.get("filedDate") ?? "").trim();
  const lifeOrLiberty = formData.get("lifeOrLiberty") === "on";
  const viaApio = formData.get("viaApio") === "on";
  if (!filedDate) return;

  const deadlines = computeInitialDeadlines({ filedDate, lifeOrLiberty, viaApio });

  await updateCase(caseId, uid, { status: "awaiting_response", filedDate, deadlines });
  revalidatePath(`/my/${caseId}`);
}

export async function runSweepAction(caseId: string, simulateDate?: string): Promise<void> {
  const { uid } = await requireSession();
  const current = await getCase(caseId, uid);
  if (!current) return;

  const now = simulateDate ? new Date(simulateDate) : new Date();
  const result = sweepCase(current, now);
  if (!result.changed) return;

  await updateCase(caseId, uid, buildSweepPatch(current, result));
  revalidatePath(`/my/${caseId}`);
}

export async function updateNotesAction(caseId: string, formData: FormData): Promise<void> {
  const { uid } = await requireSession();
  const operatorNotes = String(formData.get("operatorNotes") ?? "");
  await updateCase(caseId, uid, { operatorNotes });
  revalidatePath(`/my/${caseId}`);
}
