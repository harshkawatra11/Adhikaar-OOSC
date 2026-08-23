"use client";

import { useState } from "react";
import { lintQuestion } from "@/lib/linter/rules";
import { addQuestionAction } from "@/lib/actions";
import { CitationTag } from "@/components/CitationTag";
import { VoiceDictationButton } from "@/components/VoiceDictationButton";
import type { LintFinding } from "@/lib/types";

const SEVERITY_COLOR: Record<LintFinding["severity"], string> = {
  block: "var(--brick)",
  warn: "var(--gilt)",
  info: "var(--forest)",
};

export function QuestionComposer({ caseId }: { caseId: string }) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  const liveFindings = draft.trim() ? lintQuestion(draft) : [];

  return (
    <div className="border p-5" style={{ borderColor: "var(--rule-strong)" }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <p className="font-medium" style={{ color: "var(--ink)" }}>
          Draft the next question
        </p>
        <VoiceDictationButton onTranscript={(text) => setDraft((prev) => (prev ? prev + " " + text : text))} />
      </div>
      <textarea
        id="question-draft"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        placeholder="For example: Please provide a certified copy of the mutation register entry for khasra number 134/1, 2, 3, Wathoda, Nagpur, for the period 2018 to 2024."
        className="w-full border p-3 mb-3"
        style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
      />

      {liveFindings.length > 0 && (
        <div className="mb-3 space-y-2">
          {liveFindings.map((f) => (
            <div
              key={f.ruleId}
              className="border-l-4 pl-3 py-1.5 text-sm"
              style={{ borderColor: SEVERITY_COLOR[f.severity] }}
            >
              <p className="font-medium" style={{ color: "var(--ink)" }}>
                {f.title} <CitationTag citationId={f.citationId} />
              </p>
              <p style={{ color: "var(--ink-soft)" }}>{f.explanation}</p>
              {f.suggestedRewrite && (
                <p className="mt-1 italic" style={{ color: "var(--forest)" }}>
                  Suggested rewrite: &ldquo;{f.suggestedRewrite}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <form
        action={async (formData) => {
          setPending(true);
          try {
            await addQuestionAction(caseId, formData);
            setDraft("");
          } finally {
            setPending(false);
          }
        }}
      >
        <input type="hidden" name="question" value={draft} />
        <button
          type="submit"
          disabled={!draft.trim() || pending}
          className="border-2 px-5 py-2 font-body font-semibold disabled:opacity-40"
          style={{ background: "var(--gilt)", borderColor: "var(--ink)", color: "var(--paper)" }}
        >
          {pending ? "Adding…" : "Add question to the application"}
        </button>
      </form>
    </div>
  );
}
