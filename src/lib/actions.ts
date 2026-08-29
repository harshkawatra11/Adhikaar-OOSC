"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCase, getCase, updateCase } from "@/lib/store";
import { runJurisdictionTriage } from "@/lib/jurisdiction";
import { runRemedyTriage } from "@/lib/remedy";
import { lintQuestion } from "@/lib/linter/rules";
import { computeInitialDeadlines } from "@/lib/deadlines";
import { sweepCase } from "@/lib/sweep";
import { generatePlainLanguageCopy } from "@/lib/gemini/translate";
import { polishRewrite } from "@/lib/gemini/rewritePolish";
import type { CaseRecord, DraftQuestion } from "@/lib/types";
import { randomUUID } from "crypto";

// TODO(WP2): replaced by requireSession() once Firebase Auth lands.
// Every "TEMP_OWNER_UID" reference below is deliberate and temporary:
// it keeps the app in a single-tenant-equivalent state until real
// sessions exist, without leaving any store call unscoped in the
// meantime, since WP1 removed the no-owner code path entirely.
const TEMP_OWNER_UID = "seed-owner";

export async function intakeAction(formData: FormData): Promise<void> {
  const grievanceRaw = String(formData.get("grievance") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const isBpl = formData.get("isBpl") === "on";
  const preferredLanguage = String(formData.get("preferredLanguage") ?? "English").trim();

  const lowConfidenceFields: string[] = [];
  if (!name) lowConfidenceFields.push("applicant.name");
  if (!address) lowConfidenceFields.push("applicant.address");
  if (!state) lowConfidenceFields.push("geography.state");

  const jurisdiction = runJurisdictionTriage({ grievanceText: grievanceRaw, state });
  const remedy = runRemedyTriage(grievanceRaw);

  const record = await createCase({
    ownerUid: TEMP_OWNER_UID,
    status: "triaged",
    applicant: { name, address, isBpl, preferredLanguage },
    grievanceSummary: grievanceRaw.slice(0, 220),
    grievanceRaw,
    lowConfidenceFields,
    jurisdiction,
    remedy,
    questions: [],
    deadlines: [],
    operatorNotes: "",
  });

  revalidatePath("/docket");
  redirect(`/docket/${record.id}`);
}

export async function selectAuthorityAction(caseId: string, authorityId: string): Promise<void> {
  const current = await getCase(caseId, TEMP_OWNER_UID);
  if (!current) return;

  const jurisdiction = runJurisdictionTriage({
    grievanceText: current.grievanceRaw,
    state: current.jurisdiction?.candidates.find((c) => c.authorityId === authorityId)?.state,
    selectedAuthorityId: authorityId,
  });

  await updateCase(caseId, TEMP_OWNER_UID, { selectedAuthorityId: authorityId, jurisdiction });
  revalidatePath(`/docket/${caseId}`);
}

export async function addQuestionAction(caseId: string, formData: FormData): Promise<void> {
  const text = String(formData.get("question") ?? "").trim();
  if (!text) return;
  const current = await getCase(caseId, TEMP_OWNER_UID);
  if (!current) return;

  const findings = lintQuestion(text);
  const question: DraftQuestion = { id: randomUUID(), text, findings };

  await updateCase(caseId, TEMP_OWNER_UID, {
    questions: [...current.questions, question],
    status: current.status === "triaged" ? "drafted" : current.status,
  });
  revalidatePath(`/docket/${caseId}`);
}

export async function removeQuestionAction(caseId: string, questionId: string): Promise<void> {
  const current = await getCase(caseId, TEMP_OWNER_UID);
  if (!current) return;
  await updateCase(caseId, TEMP_OWNER_UID, {
    questions: current.questions.filter((q) => q.id !== questionId),
  });
  revalidatePath(`/docket/${caseId}`);
}

export async function acceptRewriteAction(
  caseId: string,
  questionId: string,
  variant: "mechanical" | "ai" = "mechanical"
): Promise<void> {
  const current = await getCase(caseId, TEMP_OWNER_UID);
  if (!current) return;

  const questions = current.questions.map((q) => {
    if (q.id !== questionId) return q;
    const finding = q.findings.find((f) => f.suggestedRewrite);
    const rewrite = variant === "ai" ? finding?.aiPhrasedRewrite : finding?.suggestedRewrite;
    if (!rewrite) return q;
    const newFindings = lintQuestion(rewrite);
    return { ...q, originalText: q.originalText ?? q.text, text: rewrite, findings: newFindings };
  });

  await updateCase(caseId, TEMP_OWNER_UID, { questions });
  revalidatePath(`/docket/${caseId}`);
}

export async function polishRewriteAction(
  caseId: string,
  questionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const current = await getCase(caseId, TEMP_OWNER_UID);
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
    await updateCase(caseId, TEMP_OWNER_UID, { questions });
    revalidatePath(`/docket/${caseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error." };
  }
}

export async function generatePlainLanguageCopyAction(
  caseId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const current = await getCase(caseId, TEMP_OWNER_UID);
  if (!current) return { ok: false, error: "Case not found." };

  try {
    const result = await generatePlainLanguageCopy(current);
    await updateCase(caseId, TEMP_OWNER_UID, { plainLanguageCopy: result });
    revalidatePath(`/docket/${caseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error." };
  }
}

export async function markFiledAction(caseId: string, formData: FormData): Promise<void> {
  const filedDate = String(formData.get("filedDate") ?? "").trim();
  const lifeOrLiberty = formData.get("lifeOrLiberty") === "on";
  const viaApio = formData.get("viaApio") === "on";
  if (!filedDate) return;

  const deadlines = computeInitialDeadlines({ filedDate, lifeOrLiberty, viaApio });

  await updateCase(caseId, TEMP_OWNER_UID, { status: "awaiting_response", filedDate, deadlines });
  revalidatePath(`/docket/${caseId}`);
}

export async function runSweepAction(caseId: string, simulateDate?: string): Promise<void> {
  const current = await getCase(caseId, TEMP_OWNER_UID);
  if (!current) return;

  const now = simulateDate ? new Date(simulateDate) : new Date();
  const result = sweepCase(current, now);
  if (!result.changed) return;

  const remainingDeadlines = current.deadlines.filter(
    (d) => !result.updatedDeadlines.some((u) => u.id === d.id)
  );

  const patch: Partial<CaseRecord> = {
    deadlines: [...remainingDeadlines, ...result.updatedDeadlines, ...result.newDeadlines],
  };
  if (result.nextStatus) patch.status = result.nextStatus;
  if (result.firstAppealDraft) {
    patch.operatorNotes = `${current.operatorNotes}\n\n--- Auto-drafted first appeal (${new Date().toISOString().slice(0, 10)}) ---\n${result.firstAppealDraft}`.trim();
  }

  await updateCase(caseId, TEMP_OWNER_UID, patch);
  revalidatePath(`/docket/${caseId}`);
}

export async function updateNotesAction(caseId: string, formData: FormData): Promise<void> {
  const operatorNotes = String(formData.get("operatorNotes") ?? "");
  await updateCase(caseId, TEMP_OWNER_UID, { operatorNotes });
  revalidatePath(`/docket/${caseId}`);
}
