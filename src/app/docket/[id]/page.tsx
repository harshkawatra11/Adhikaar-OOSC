import { notFound } from "next/navigation";
import { getCase } from "@/lib/store";
import { StatusChip } from "@/components/StatusChip";
import { CitationTag } from "@/components/CitationTag";
import { QuestionComposer } from "@/components/QuestionComposer";
import { PolishRewriteButton } from "@/components/PolishRewriteButton";
import { PlainLanguageCopy } from "@/components/PlainLanguageCopy";
import { SubmitButton } from "@/components/SubmitButton";
import {
  selectAuthorityAction,
  removeQuestionAction,
  acceptRewriteAction,
  markFiledAction,
  runSweepAction,
  updateNotesAction,
} from "@/lib/actions";
import { lookupStateFee, CENTRAL_FEE, BPL_EXEMPTION_NOTE } from "@/lib/data/state-fees";
import { daysUntil, isOverdue } from "@/lib/deadlines";
import type { LintFinding } from "@/lib/types";

export const dynamic = "force-dynamic";

const SEVERITY_COLOR: Record<LintFinding["severity"], string> = {
  block: "var(--brick)",
  warn: "var(--gilt)",
  info: "var(--forest)",
};

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseRecord = await getCase(id);
  if (!caseRecord) notFound();

  const j = caseRecord.jurisdiction;
  const r = caseRecord.remedy;

  const fee = j?.level === "state"
    ? lookupStateFee(j.candidates[0]?.state ?? "")
    : CENTRAL_FEE;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b-2" style={{ borderColor: "var(--ink)" }}>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--ink-faint)" }}>
            Case {caseRecord.id.slice(0, 8)}
          </p>
          <h1 className="font-display font-bold text-3xl mb-2" style={{ color: "var(--ink)" }}>
            {caseRecord.applicant.name || "Unnamed applicant"}
          </h1>
          <p className="max-w-xl" style={{ color: "var(--ink-soft)" }}>{caseRecord.grievanceRaw}</p>
        </div>
        <StatusChip status={caseRecord.status} />
      </div>

      {caseRecord.lowConfidenceFields.length > 0 && (
        <Banner tone="warn">
          The following fields were not provided and were not guessed: {caseRecord.lowConfidenceFields.join(", ")}.
          Fill these in before filing.
        </Banner>
      )}

      {/* Remedy triage */}
      {r && (
        <Section title="Is this the right instrument?">
          <div className="border p-5" style={{ borderColor: "var(--rule-strong)" }}>
            <p className="font-mono text-xs uppercase tracking-wide mb-2" style={{ color: r.remedyClass === "rti" ? "var(--forest)" : "var(--brick)" }}>
              {r.remedyClass === "rti" ? "Proceed as a Right to Information application" : `Remedy class: ${r.remedyClass}`}
            </p>
            <p className="mb-2 font-medium" style={{ color: "var(--ink)" }}>{r.forumName}</p>
            <p className="text-sm mb-2" style={{ color: "var(--ink-soft)" }}>{r.guidanceNote}</p>
            <p className="text-sm" style={{ color: "var(--ink-faint)" }}>Limitation: {r.limitationPeriod}</p>
            {r.pecuniaryJurisdiction && (
              <p className="text-sm mt-2" style={{ color: "var(--ink-soft)" }}>
                Pecuniary jurisdiction: <strong>{r.pecuniaryJurisdiction.level} Commission</strong>. {r.pecuniaryJurisdiction.reasoning}
              </p>
            )}
            {r.citationIds.map((cid) => (
              <span key={cid} className="mr-2 inline-block mt-2">
                <CitationTag citationId={cid} />
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Jurisdiction triage */}
      {j && (
        <Section title="Which government, and which office?">
          <div className="mb-4 flex flex-wrap gap-3 text-sm">
            <Tag>{j.scheduleList} subject</Tag>
            <Tag>{j.subjectMatter}</Tag>
            {j.scheduleEntry && <Tag>{j.scheduleEntry}</Tag>}
          </div>

          {j.blockingWarning && (
            <Banner tone="block">
              {j.blockingWarning.message} <CitationTag citationId={j.blockingWarning.citationId} label="See the rule" />
            </Banner>
          )}

          {j.candidates.length === 0 ? (
            <Banner tone="warn">
              No authority in this directory matches. This case is out of coverage; do not guess an address.
            </Banner>
          ) : (
            <form
              action={async (formData) => {
                "use server";
                await selectAuthorityAction(caseRecord.id, String(formData.get("authorityId")));
              }}
              className="space-y-3"
            >
              {j.candidates.map((c) => (
                <label
                  key={c.authorityId}
                  className="flex gap-3 border p-4 cursor-pointer"
                  style={{
                    borderColor: caseRecord.selectedAuthorityId === c.authorityId ? "var(--seal)" : "var(--rule-strong)",
                    background: caseRecord.selectedAuthorityId === c.authorityId ? "var(--seal-tint)" : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="authorityId"
                    value={c.authorityId}
                    defaultChecked={caseRecord.selectedAuthorityId === c.authorityId}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium" style={{ color: "var(--ink)" }}>{c.authorityName}</p>
                      <span className="font-mono text-xs" style={{ color: "var(--ink-faint)" }}>
                        confidence {Math.round(c.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-sm mb-1" style={{ color: "var(--ink-soft)" }}>{c.department}</p>
                    <p className="text-xs mb-2" style={{ color: "var(--ink-faint)" }}>{c.cpioAddress}</p>
                    <p className="text-xs" style={{ color: "var(--ink-soft)" }}>{c.reasoning}</p>
                  </div>
                </label>
              ))}
              <SubmitButton
                pendingLabel="Confirming…"
                className="border-2 px-5 py-2 font-body font-semibold"
                style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
              >
                Confirm authority
              </SubmitButton>
            </form>
          )}
        </Section>
      )}

      {/* Questions */}
      <Section title="The application">
        <div className="space-y-4 mb-5">
          {caseRecord.questions.length === 0 && (
            <p className="text-sm" style={{ color: "var(--ink-faint)" }}>No questions drafted yet.</p>
          )}
          {caseRecord.questions.map((q, idx) => (
            <div key={q.id} className="border p-4" style={{ borderColor: "var(--rule-strong)" }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <p style={{ color: "var(--ink)" }}>
                  <span className="font-mono text-xs mr-2" style={{ color: "var(--ink-faint)" }}>{idx + 1}.</span>
                  {q.text}
                </p>
                <form
                  action={async () => {
                    "use server";
                    await removeQuestionAction(caseRecord.id, q.id);
                  }}
                >
                  <SubmitButton
                    pendingLabel="Removing…"
                    className="text-xs underline shrink-0"
                    style={{ color: "var(--brick)" }}
                  >
                    Remove
                  </SubmitButton>
                </form>
              </div>
              {q.originalText && (
                <p className="text-xs italic mb-2" style={{ color: "var(--ink-faint)" }}>
                  Rewritten from: &ldquo;{q.originalText}&rdquo;
                </p>
              )}
              {q.findings.length > 0 && (
                <div className="space-y-2 mt-2">
                  {q.findings.map((f) => (
                    <div key={f.ruleId} className="border-l-4 pl-3 py-1 text-sm" style={{ borderColor: SEVERITY_COLOR[f.severity] }}>
                      <p className="font-medium" style={{ color: "var(--ink)" }}>
                        {f.title} <CitationTag citationId={f.citationId} />
                      </p>
                      <p style={{ color: "var(--ink-soft)" }}>{f.explanation}</p>
                      {f.suggestedRewrite && (
                        <form
                          action={async () => {
                            "use server";
                            await acceptRewriteAction(caseRecord.id, q.id);
                          }}
                          className="mt-1"
                        >
                          <p className="italic mb-1" style={{ color: "var(--forest)" }}>
                            Suggested rewrite: &ldquo;{f.suggestedRewrite}&rdquo;
                          </p>
                          <SubmitButton
                            pendingLabel="Accepting…"
                            className="text-xs underline font-medium"
                            style={{ color: "var(--forest)" }}
                          >
                            Accept rewrite
                          </SubmitButton>
                        </form>
                      )}
                      {f.suggestedRewrite && (
                        <PolishRewriteButton caseId={caseRecord.id} questionId={q.id} finding={f} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <QuestionComposer caseId={caseRecord.id} />
      </Section>

      {/* Plain-language copy for the citizen */}
      <Section title="Plain-language copy for the citizen">
        <PlainLanguageCopy
          caseId={caseRecord.id}
          language={caseRecord.applicant.preferredLanguage}
          existing={caseRecord.plainLanguageCopy}
          hasQuestions={caseRecord.questions.length > 0}
        />
      </Section>

      {/* Fee */}
      <Section title="Fee">
        <div className="border p-4 text-sm" style={{ borderColor: "var(--rule-strong)" }}>
          {caseRecord.applicant.isBpl ? (
            <p style={{ color: "var(--forest)" }}>{BPL_EXEMPTION_NOTE}</p>
          ) : fee ? (
            <>
              <p style={{ color: "var(--ink)" }}>
                Rs. {fee.amount}, payable via {fee.paymentModes.join(", ")}
              </p>
              {"confidence" in fee && fee.confidence !== "verified" && (
                <p className="mt-1" style={{ color: "var(--brick)" }}>
                  {fee.confidence === "conflicting_sources" ? "Sources disagree on this figure." : "This figure is unverified."}{" "}
                  {"note" in fee && fee.note}
                </p>
              )}
            </>
          ) : (
            <p style={{ color: "var(--ink-faint)" }}>Select an authority to compute the fee.</p>
          )}
        </div>
      </Section>

      {/* Filing and deadlines */}
      <Section title="Statutory clock">
        {caseRecord.status === "triaged" || caseRecord.status === "drafted" ? (
          <form
            action={async (formData) => {
              "use server";
              await markFiledAction(caseRecord.id, formData);
            }}
            className="border p-5 space-y-4"
            style={{ borderColor: "var(--rule-strong)" }}
          >
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Mark this application as filed to start the statutory clock.
            </p>
            <label className="block">
              <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Date filed</span>
              <input
                type="date"
                name="filedDate"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="border p-2"
                style={{ borderColor: "var(--rule-strong)" }}
              />
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
              <input type="checkbox" name="lifeOrLiberty" /> Concerns life or liberty (forty-eight hour track)
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
              <input type="checkbox" name="viaApio" /> Filed via an Assistant Public Information Officer
            </label>
            <SubmitButton
              pendingLabel="Filing…"
              className="border-2 px-5 py-2 font-body font-semibold"
              style={{ background: "var(--forest)", borderColor: "var(--ink)", color: "var(--paper)" }}
            >
              Mark filed and start the clock
            </SubmitButton>
          </form>
        ) : (
          <div className="space-y-3">
            {caseRecord.deadlines.map((d) => {
              const overdue = isOverdue(d);
              return (
                <div
                  key={d.id}
                  className="border p-4 flex flex-wrap items-center justify-between gap-3"
                  style={{ borderColor: overdue ? "var(--brick)" : "var(--rule-strong)" }}
                >
                  <div>
                    <p className="font-medium" style={{ color: "var(--ink)" }}>{d.label}</p>
                    <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                      {d.basis}, due {d.dueDate}
                    </p>
                  </div>
                  <span
                    className="font-mono text-xs uppercase px-2 py-1 border"
                    style={{
                      color: d.status === "missed" ? "var(--brick)" : overdue ? "var(--brick)" : "var(--forest)",
                      borderColor: d.status === "missed" || overdue ? "var(--brick)" : "var(--forest)",
                    }}
                  >
                    {d.status === "missed" ? "Missed" : overdue ? "Overdue" : `${daysUntil(d)} day(s) left`}
                  </span>
                </div>
              );
            })}

            <details className="border p-4 text-sm" style={{ borderColor: "var(--rule)" }}>
              <summary className="cursor-pointer font-medium" style={{ color: "var(--ink)" }}>
                Run the daily sweep manually (demo control)
              </summary>
              <p className="mt-3 mb-3" style={{ color: "var(--ink-soft)" }}>
                In production this runs once a day for every open case via Cloud Scheduler. For demonstration you
                can trigger it here, optionally simulating a later date to show what happens once a deadline lapses.
              </p>
              <form
                action={async (formData) => {
                  "use server";
                  const simulateDate = String(formData.get("simulateDate") ?? "") || undefined;
                  await runSweepAction(caseRecord.id, simulateDate);
                }}
                className="flex flex-wrap items-end gap-3"
              >
                <label className="block">
                  <span className="block text-xs mb-1" style={{ color: "var(--ink-faint)" }}>Simulate &ldquo;today&rdquo; as</span>
                  <input type="date" name="simulateDate" className="border p-2 text-sm" style={{ borderColor: "var(--rule-strong)" }} />
                </label>
                <SubmitButton
                  pendingLabel="Running…"
                  className="border-2 px-4 py-2 text-sm font-semibold"
                  style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
                >
                  Run sweep
                </SubmitButton>
              </form>
            </details>
          </div>
        )}
      </Section>

      {caseRecord.operatorNotes && (
        <Section title="Drafted appeal and notes">
          <pre
            className="border p-4 text-sm whitespace-pre-wrap font-mono"
            style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)", color: "var(--ink)" }}
          >
            {caseRecord.operatorNotes}
          </pre>
        </Section>
      )}

      {/* PDF export */}
      <Section title="Export">
        <a
          href={`/api/cases/${caseRecord.id}/pdf`}
          className="border-2 px-6 py-3 font-body font-semibold inline-block"
          style={{
            background: caseRecord.questions.length && caseRecord.selectedAuthorityId ? "var(--seal)" : "var(--paper-deep)",
            borderColor: "var(--ink)",
            color: caseRecord.questions.length && caseRecord.selectedAuthorityId ? "var(--paper)" : "var(--ink-faint)",
            pointerEvents: caseRecord.questions.length && caseRecord.selectedAuthorityId ? "auto" : "none",
          }}
        >
          Download the application as a PDF
        </a>
        {(!caseRecord.questions.length || !caseRecord.selectedAuthorityId) && (
          <p className="text-sm mt-2" style={{ color: "var(--ink-faint)" }}>
            Select an authority and add at least one question first.
          </p>
        )}
      </Section>

      {/* Notes */}
      <Section title="Operator notes">
        <form
          action={async (formData) => {
            "use server";
            await updateNotesAction(caseRecord.id, formData);
          }}
        >
          <textarea
            name="operatorNotes"
            defaultValue={caseRecord.operatorNotes}
            rows={4}
            className="w-full border p-3 text-sm mb-3"
            style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
          />
          <SubmitButton
            pendingLabel="Saving…"
            className="border-2 px-4 py-2 text-sm font-semibold"
            style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
          >
            Save notes
          </SubmitButton>
        </form>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display font-semibold text-xl mb-4 pb-2 border-b" style={{ borderColor: "var(--rule)", color: "var(--ink)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border px-2.5 py-1 font-mono text-xs" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-soft)" }}>
      {children}
    </span>
  );
}

function Banner({ tone, children }: { tone: "block" | "warn"; children: React.ReactNode }) {
  const color = tone === "block" ? "var(--brick)" : "var(--gilt)";
  return (
    <div className="border-2 p-4 text-sm leading-relaxed" style={{ borderColor: color, background: "var(--paper-raised)", color: "var(--ink)" }}>
      {children}
    </div>
  );
}
