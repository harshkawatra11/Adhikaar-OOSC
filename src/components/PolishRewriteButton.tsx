"use client";

import { useState } from "react";
import { polishRewriteAction, acceptRewriteAction } from "@/lib/actions";
import type { LintFinding } from "@/lib/types";

// The visible edge of the propose-versus-decide boundary: the mechanical
// rewrite already exists and is already safe to file as-is. This button
// only ever asks a model for a second, more natural-sounding option next
// to it. Nothing here is applied until an operator clicks one of the two
// Accept buttons; a Gemini call that fails just shows an error inline
// and leaves the mechanical rewrite exactly as usable as it was.

export function PolishRewriteButton({
  caseId,
  questionId,
  finding,
}: {
  caseId: string;
  questionId: string;
  finding: LintFinding;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  if (finding.aiPhrasedRewrite) {
    return (
      <p className="mt-1 italic" style={{ color: "var(--gilt)" }}>
        Gemini-phrased alternative: &ldquo;{finding.aiPhrasedRewrite}&rdquo;{" "}
        <button
          type="button"
          disabled={accepting}
          onClick={async () => {
            setAccepting(true);
            await acceptRewriteAction(caseId, questionId, "ai");
          }}
          className="text-xs underline font-medium not-italic disabled:opacity-50"
          style={{ color: "var(--gilt)" }}
        >
          {accepting ? "Accepting…" : "Accept this phrasing instead"}
        </button>
      </p>
    );
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const result = await polishRewriteAction(caseId, questionId);
          if (!result.ok) setError(result.error);
          setPending(false);
        }}
        className="text-xs underline disabled:opacity-50"
        style={{ color: "var(--ink-faint)" }}
      >
        {pending ? "Asking Gemini…" : "Ask Gemini for a more natural phrasing"}
      </button>
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--brick)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
