"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceDictationButton } from "@/components/VoiceDictationButton";
import { CitationTag } from "@/components/CitationTag";
import { askRightsAction } from "@/lib/rights/actions";
import type { RightsAnswer } from "@/lib/rights/answer";

export function RightsAsk() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<RightsAnswer | null>(null);
  const [pending, setPending] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;
    setPending(true);
    try {
      const result = await askRightsAction(question);
      setAnswer(result);
    } finally {
      setPending(false);
    }
  }

  function handleGetTheRecord() {
    // Seeds the interview with this question, matching what a citizen
    // typed here, so the handoff between "explain my rights" and "help
    // me get the record" is one click, not a restart.
    const params = new URLSearchParams({ problem: answer?.question ?? question });
    router.push(`/start?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="border p-5" style={{ borderColor: "var(--rule-strong)" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
            Ask about a right, in your own words
          </p>
          <VoiceDictationButton onTranscript={(t) => setQuestion((prev) => (prev ? prev + " " + t : t))} />
        </div>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="For example: my landlord is refusing to return my security deposit after I vacated the flat."
          className="w-full border p-3 mb-3"
          style={{ borderColor: "var(--rule-strong)", background: "var(--paper)", color: "var(--ink)" }}
        />
        <button
          type="button"
          onClick={handleAsk}
          disabled={!question.trim() || pending}
          className="border-2 px-6 py-3 font-body font-semibold disabled:opacity-40"
          style={{ background: "var(--seal)", borderColor: "var(--ink)", color: "var(--paper)" }}
        >
          {pending ? "Checking the corpus…" : "Ask"}
        </button>
      </div>

      {answer && answer.status === "no_source" && (
        <div className="border-2 p-6" style={{ borderColor: "var(--gilt)", background: "var(--gilt-tint)" }}>
          <p className="font-mono text-xs uppercase tracking-wide mb-2" style={{ color: "var(--gilt)" }}>
            No source for this
          </p>
          <p className="mb-3" style={{ color: "var(--ink)" }}>
            We could not find a statute in our corpus that speaks to this question with enough
            confidence to answer. Rather than guess, we are saying so.
          </p>
          <p className="text-sm mb-2" style={{ color: "var(--ink-soft)" }}>What we do cover:</p>
          <ul className="text-sm list-disc list-inside space-y-1" style={{ color: "var(--ink-soft)" }}>
            {answer.coveredTopics.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      )}

      {answer && answer.status === "answered" && (
        <div className="space-y-4">
          {answer.plainLanguage && (
            <div className="border-2 p-5" style={{ borderColor: "var(--forest)", background: "var(--forest-tint)" }}>
              <p className="font-mono text-xs uppercase tracking-wide mb-2" style={{ color: "var(--forest)" }}>
                In plain language
              </p>
              <p style={{ color: "var(--ink)" }}>{answer.plainLanguage.text}</p>
            </div>
          )}

          <div className="space-y-3">
            {answer.chunks.map((chunk) => (
              <div key={chunk.id} className="border p-4" style={{ borderColor: "var(--rule-strong)" }}>
                <p className="font-mono text-xs mb-1" style={{ color: "var(--seal-deep)" }}>
                  {chunk.act}, {chunk.section} <CitationTag citationId={chunk.id} label="Read the text" />
                </p>
                <p className="font-medium mb-2" style={{ color: "var(--ink)" }}>{chunk.heading}</p>
                {chunk.note && (
                  <p className="text-sm" style={{ color: "var(--ink-soft)" }}>{chunk.note}</p>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
            This explains what the law says. It is not advice about your specific situation, and
            for that you need a lawyer or a legal aid clinic.
          </p>

          <button
            type="button"
            onClick={handleGetTheRecord}
            className="border-2 px-6 py-3 font-body font-semibold"
            style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
          >
            Get the record you will need
          </button>
        </div>
      )}
    </div>
  );
}
