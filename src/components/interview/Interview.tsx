"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StepShell } from "@/components/interview/StepShell";
import { VoiceDictationButton } from "@/components/VoiceDictationButton";
import { CitationTag } from "@/components/CitationTag";
import { STEPS, type StepId } from "@/lib/interview/graph";
import { nextStep } from "@/lib/interview/engine";
import { suggestQuestionTemplates } from "@/lib/interview/questionTemplates";
import { runJurisdictionTriage } from "@/lib/jurisdiction";
import { runRemedyTriage } from "@/lib/remedy";
import { lintQuestion } from "@/lib/linter/rules";
import { lookupStateFee, CENTRAL_FEE, BPL_EXEMPTION_NOTE } from "@/lib/data/state-fees";
import { createFilingAction } from "@/lib/actions";
import type { JurisdictionTriageResult, RemedyTriageResult, LintFinding } from "@/lib/types";
import type { Lang } from "@/lib/i18n/dictionary";

const STATES = [
  "Delhi",
  "Maharashtra",
  "Andhra Pradesh",
  "Bihar",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Other",
];

const SEVERITY_COLOR: Record<LintFinding["severity"], string> = {
  block: "var(--brick)",
  warn: "var(--gilt)",
  info: "var(--forest)",
};

const PrimaryButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className="border-2 px-6 py-3 font-body font-semibold disabled:opacity-40"
    style={{ background: "var(--seal)", borderColor: "var(--ink)", color: "var(--paper)" }}
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className="px-2 py-2 text-sm underline disabled:opacity-40"
    style={{ color: "var(--ink-soft)" }}
  >
    {children}
  </button>
);

// TODO: full Hindi translation of this component's own strings is
// still pending; `lang` threaded through now so page-level wiring is
// correct. Interim state under time pressure.
export function Interview({ initialProblem, lang = "en" }: { initialProblem?: string; lang?: Lang }) {
  void lang;
  const router = useRouter();

  const [history, setHistory] = useState<StepId[]>(["problem"]);
  const step = history[history.length - 1];

  const [problem, setProblem] = useState(initialProblem ?? "");
  const [jurisdiction, setJurisdiction] = useState<JurisdictionTriageResult | null>(null);
  const [remedy, setRemedy] = useState<RemedyTriageResult | null>(null);
  const [selectedState, setSelectedState] = useState("");
  const [authorityId, setAuthorityId] = useState<string | undefined>(undefined);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionDraft, setQuestionDraft] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isBpl, setIsBpl] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState("Hindi");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = STEPS[step];
  const liveFindings = useMemo(() => (questionDraft.trim() ? lintQuestion(questionDraft) : []), [questionDraft]);

  function goTo(next: StepId | null) {
    if (!next) return;
    setHistory((h) => [...h, next]);
  }

  function goBack() {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }

  function handleProblemNext() {
    if (!problem.trim()) return;
    const j = runJurisdictionTriage({ grievanceText: problem });
    const r = runRemedyTriage(problem);
    setJurisdiction(j);
    setRemedy(r);
    goTo("triage_result");
  }

  function handleTriageResultNext() {
    if (!jurisdiction || !remedy) return;
    goTo(nextStep("triage_result", {}, jurisdiction, remedy));
  }

  function handleWrongInstrumentContinue() {
    if (!jurisdiction || !remedy) return;
    goTo(nextStep("wrong_instrument", { acknowledgedWrongInstrument: true }, jurisdiction, remedy));
  }

  function handleStateNext() {
    if (!jurisdiction || !remedy || !selectedState) return;
    const j = runJurisdictionTriage({ grievanceText: problem, state: selectedState });
    setJurisdiction(j);
    goTo(nextStep("state", { state: selectedState }, j, remedy));
  }

  function handleAuthorityNext() {
    if (!jurisdiction || !remedy) return;
    const j = authorityId
      ? runJurisdictionTriage({ grievanceText: problem, state: selectedState || undefined, selectedAuthorityId: authorityId })
      : jurisdiction;
    setJurisdiction(j);
    goTo(nextStep("authority", { authorityId }, j, remedy));
  }

  function addQuestion(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setQuestions((qs) => [...qs, trimmed]);
    setQuestionDraft("");
  }

  function handleQuestionsNext() {
    if (!jurisdiction || !remedy) return;
    goTo(nextStep("questions", {}, jurisdiction, remedy));
  }

  function handleApplicantNext() {
    if (!jurisdiction || !remedy) return;
    goTo(nextStep("applicant", {}, jurisdiction, remedy));
  }

  async function handleCreateFiling() {
    setSubmitting(true);
    setError(null);
    try {
      const { id } = await createFilingAction({
        grievanceRaw: problem,
        name,
        address,
        state: selectedState,
        isBpl,
        preferredLanguage,
        authorityId,
        questions,
      });
      router.push(`/my/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong creating your filing.");
      setSubmitting(false);
    }
  }

  const fee = jurisdiction?.level === "state"
    ? lookupStateFee(jurisdiction.candidates[0]?.state ?? selectedState)
    : CENTRAL_FEE;

  // ---- problem ----
  if (step === "problem") {
    return (
      <StepShell
        eyebrow="Start a filing"
        title={copy.titleEn}
        help={copy.helpEn}
        footer={<PrimaryButton onClick={handleProblemNext} disabled={!problem.trim()}>Continue</PrimaryButton>}
      >
        <div className="flex items-center justify-end mb-2">
          <VoiceDictationButton onTranscript={(t) => setProblem((prev) => (prev ? prev + " " + t : t))} />
        </div>
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          rows={6}
          placeholder="For example: I want a copy of the 7/12 extract and mutation register for my father's land in Nagpur taluka, khasra number 134/1, 2, 3."
          className="w-full border p-3 font-body text-base"
          style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
        />
      </StepShell>
    );
  }

  // ---- triage_result ----
  if (step === "triage_result" && jurisdiction && remedy) {
    return (
      <StepShell
        eyebrow="Step 2"
        title={copy.titleEn}
        help={copy.helpEn}
        footer={
          <>
            <SecondaryButton onClick={goBack}>Back</SecondaryButton>
            <PrimaryButton onClick={handleTriageResultNext}>Continue</PrimaryButton>
          </>
        }
      >
        <div className="border-2 p-6 space-y-3" style={{ borderColor: "var(--forest)", background: "var(--forest-tint)" }}>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="border px-2.5 py-1 font-mono text-xs" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-soft)" }}>
              {jurisdiction.scheduleList} subject
            </span>
            <span className="border px-2.5 py-1 font-mono text-xs" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-soft)" }}>
              {jurisdiction.subjectMatter}
            </span>
          </div>
          <p style={{ color: "var(--ink)" }}>
            {jurisdiction.scheduleList === "State" && (
              <>This is a <strong>State subject</strong> ({jurisdiction.scheduleEntry}). A Central government office cannot lawfully answer this: under the rule in <CitationTag citationId="rti-6-3" />, it would be returned to you rather than forwarded, and the fee is not refunded.</>
            )}
            {jurisdiction.scheduleList === "Union" && (
              <>This is a <strong>Central (Union) subject</strong> ({jurisdiction.scheduleEntry}). A Central government office is the right one to write to.</>
            )}
            {jurisdiction.scheduleList === "Concurrent" && (
              <>Both the Centre and your State can act on this ({jurisdiction.scheduleEntry}). We will help you pick the right one.</>
            )}
            {jurisdiction.scheduleList === "Unclassified" && (
              <>We could not confidently classify the subject matter from what you wrote. We will not guess; you can pick the office yourself in the next step.</>
            )}
          </p>
          {remedy.remedyClass !== "rti" && (
            <p className="text-sm" style={{ color: "var(--brick)" }}>
              One more thing: this reads less like a records request and more like a {remedy.remedyClass} matter.
              We will explain on the next screen.
            </p>
          )}
        </div>
      </StepShell>
    );
  }

  // ---- wrong_instrument ----
  if (step === "wrong_instrument" && remedy) {
    return (
      <StepShell
        eyebrow="Step 3"
        title={copy.titleEn}
        help={copy.helpEn}
        footer={
          <>
            <SecondaryButton onClick={goBack}>Back</SecondaryButton>
            {!remedy.outOfCoverage && (
              <PrimaryButton onClick={handleWrongInstrumentContinue}>
                Continue anyway, to get the record
              </PrimaryButton>
            )}
          </>
        }
      >
        <div className="border-2 p-6 space-y-3" style={{ borderColor: "var(--brick)", background: "var(--brick-tint)" }}>
          <p className="font-mono text-xs uppercase tracking-wide" style={{ color: "var(--brick)" }}>
            This is really a {remedy.remedyClass} matter
          </p>
          <p className="font-medium" style={{ color: "var(--ink)" }}>{remedy.forumName}</p>
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>{remedy.guidanceNote}</p>
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>Limitation: {remedy.limitationPeriod}</p>
          {remedy.pecuniaryJurisdiction && (
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              <strong>{remedy.pecuniaryJurisdiction.level} Commission</strong>. {remedy.pecuniaryJurisdiction.reasoning}
            </p>
          )}
        </div>
      </StepShell>
    );
  }

  // ---- state ----
  if (step === "state") {
    return (
      <StepShell
        eyebrow="Step 4"
        title={copy.titleEn}
        help={copy.helpEn}
        footer={
          <>
            <SecondaryButton onClick={goBack}>Back</SecondaryButton>
            <PrimaryButton onClick={handleStateNext} disabled={!selectedState}>Continue</PrimaryButton>
          </>
        }
      >
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full border p-3"
          style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
        >
          <option value="">Select your state</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}{(s === "Delhi" || s === "Maharashtra") ? " (covered in depth)" : ""}</option>
          ))}
        </select>
        <p className="text-sm mt-3" style={{ color: "var(--ink-faint)" }}>
          Adhikaar currently covers Delhi and Maharashtra in depth at the department level. For any other
          state we will say so honestly rather than guess an address.
        </p>
      </StepShell>
    );
  }

  // ---- authority ----
  if (step === "authority" && jurisdiction) {
    return (
      <StepShell
        eyebrow="Step 5"
        title={copy.titleEn}
        help={copy.helpEn}
        footer={
          <>
            <SecondaryButton onClick={goBack}>Back</SecondaryButton>
            <PrimaryButton onClick={handleAuthorityNext} disabled={!authorityId}>Continue</PrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          {jurisdiction.candidates.map((c) => (
            <label
              key={c.authorityId}
              className="flex gap-3 border p-4 cursor-pointer"
              style={{
                borderColor: authorityId === c.authorityId ? "var(--seal)" : "var(--rule-strong)",
                background: authorityId === c.authorityId ? "var(--seal-tint)" : "transparent",
              }}
            >
              <input
                type="radio"
                name="authorityId"
                checked={authorityId === c.authorityId}
                onChange={() => setAuthorityId(c.authorityId)}
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
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>{c.reasoning}</p>
              </div>
            </label>
          ))}
        </div>
      </StepShell>
    );
  }

  // ---- questions ----
  if (step === "questions" && jurisdiction) {
    const templates = suggestQuestionTemplates(jurisdiction.subjectMatter);
    return (
      <StepShell
        eyebrow="Step 6"
        title={copy.titleEn}
        help={copy.helpEn}
        footer={
          <>
            <SecondaryButton onClick={goBack}>Back</SecondaryButton>
            <PrimaryButton onClick={handleQuestionsNext} disabled={questions.length === 0}>Continue</PrimaryButton>
          </>
        }
      >
        {questions.length > 0 && (
          <div className="space-y-2 mb-4">
            {questions.map((q, i) => (
              <div key={i} className="border p-3 flex items-start justify-between gap-3" style={{ borderColor: "var(--rule-strong)" }}>
                <p className="text-sm" style={{ color: "var(--ink)" }}>
                  <span className="font-mono text-xs mr-2" style={{ color: "var(--ink-faint)" }}>{i + 1}.</span>
                  {q}
                </p>
                <button
                  type="button"
                  onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))}
                  className="text-xs underline shrink-0"
                  style={{ color: "var(--brick)" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {questions.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {templates.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => addQuestion(t)}
                className="border px-3 py-2 text-xs text-left"
                style={{ borderColor: "var(--rule-strong)", color: "var(--ink-soft)" }}
              >
                Use: &ldquo;{t.slice(0, 70)}{t.length > 70 ? "…" : ""}&rdquo;
              </button>
            ))}
          </div>
        )}

        <div className="border p-4" style={{ borderColor: "var(--rule-strong)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>Write your own question</p>
            <VoiceDictationButton onTranscript={(t) => setQuestionDraft((prev) => (prev ? prev + " " + t : t))} />
          </div>
          <textarea
            value={questionDraft}
            onChange={(e) => setQuestionDraft(e.target.value)}
            rows={3}
            className="w-full border p-3 mb-3"
            style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
          />
          {liveFindings.length > 0 && (
            <div className="mb-3 space-y-2">
              {liveFindings.map((f) => (
                <div key={f.ruleId} className="border-l-4 pl-3 py-1.5 text-sm" style={{ borderColor: SEVERITY_COLOR[f.severity] }}>
                  <p className="font-medium" style={{ color: "var(--ink)" }}>
                    {f.title} <CitationTag citationId={f.citationId} />
                  </p>
                  <p style={{ color: "var(--ink-soft)" }}>{f.explanation}</p>
                  {f.suggestedRewrite && (
                    <p className="mt-1 italic" style={{ color: "var(--forest)" }}>Suggested: &ldquo;{f.suggestedRewrite}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => addQuestion(questionDraft)}
            disabled={!questionDraft.trim()}
            className="border-2 px-4 py-2 text-sm font-semibold disabled:opacity-40"
            style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
          >
            Add this question
          </button>
        </div>
      </StepShell>
    );
  }

  // ---- applicant ----
  if (step === "applicant") {
    return (
      <StepShell
        eyebrow="Step 7"
        title={copy.titleEn}
        help={copy.helpEn}
        footer={
          <>
            <SecondaryButton onClick={goBack}>Back</SecondaryButton>
            <PrimaryButton onClick={handleApplicantNext} disabled={!name.trim() || !address.trim()}>Continue</PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Your address</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </label>
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
            That is all we need. Under <CitationTag citationId="rti-6-2" />, you are never required to explain
            why you want this.
          </p>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={isBpl} onChange={(e) => setIsBpl(e.target.checked)} className="h-4 w-4" />
            <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
              I hold a Below Poverty Line certificate (fee exempt)
            </span>
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
              Language for your plain-language copy
            </span>
            <input
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full border p-3"
              style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </label>
        </div>
      </StepShell>
    );
  }

  // ---- review ----
  if (step === "review" && jurisdiction) {
    const authorityName = jurisdiction.candidates.find((c) => c.authorityId === authorityId)?.authorityName;
    return (
      <StepShell
        eyebrow="Step 8"
        title={copy.titleEn}
        help={copy.helpEn}
        footer={
          <>
            <SecondaryButton onClick={goBack} disabled={submitting}>Back</SecondaryButton>
            <PrimaryButton onClick={handleCreateFiling} disabled={submitting}>
              {submitting ? "Preparing…" : "Prepare my application"}
            </PrimaryButton>
          </>
        }
      >
        <div className="border p-5 space-y-3" style={{ borderColor: "var(--rule-strong)" }}>
          {authorityName && (
            <p style={{ color: "var(--ink)" }}><strong>To:</strong> {authorityName}</p>
          )}
          <div>
            <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>Your questions</p>
            <ol className="list-decimal list-inside text-sm space-y-1" style={{ color: "var(--ink-soft)" }}>
              {questions.map((q, i) => <li key={i}>{q}</li>)}
            </ol>
          </div>
          <div className="text-sm" style={{ color: "var(--ink-soft)" }}>
            {isBpl ? (
              <p style={{ color: "var(--forest)" }}>{BPL_EXEMPTION_NOTE}</p>
            ) : fee ? (
              <p>Fee: Rs. {fee.amount}, payable via {fee.paymentModes.join(", ")}</p>
            ) : null}
          </div>
          {error && (
            <p className="border p-3 text-sm" style={{ borderColor: "var(--brick)", color: "var(--brick)" }}>{error}</p>
          )}
        </div>
      </StepShell>
    );
  }

  // ---- out_of_coverage ----
  if (step === "out_of_coverage") {
    return (
      <StepShell
        eyebrow="Out of coverage"
        title={copy.titleEn}
        help={copy.helpEn}
        footer={<SecondaryButton onClick={goBack}>Back</SecondaryButton>}
      >
        <div className="border-2 p-6" style={{ borderColor: "var(--gilt)", background: "var(--gilt-tint)" }}>
          {jurisdiction?.blockingWarning ? (
            <p style={{ color: "var(--ink)" }}>
              {jurisdiction.blockingWarning.message}{" "}
              <CitationTag citationId={jurisdiction.blockingWarning.citationId} label="See the rule" />
            </p>
          ) : remedy?.remedyClass === "tenancy" ? (
            <p style={{ color: "var(--ink)" }}>
              Tenancy law is entirely state-legislated with no uniform national statute, and this directory
              does not cover any state rent authority. Direct this to the State Rent Authority for your
              state, or to a local legal aid clinic.
            </p>
          ) : (
            <p style={{ color: "var(--ink)" }}>
              We could not find an authority in our directory that matches this. Rather than guess an
              address that turns out to be wrong, we are saying so.
            </p>
          )}
        </div>
      </StepShell>
    );
  }

  return null;
}
