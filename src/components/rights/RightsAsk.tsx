"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceDictationButton } from "@/components/VoiceDictationButton";
import { CitationTag } from "@/components/CitationTag";
import { askRightsAction } from "@/lib/rights/actions";
import { t, type Lang } from "@/lib/i18n/dictionary";
import type { RightsAnswer } from "@/lib/rights/answer";

export function RightsAsk({ lang }: { lang: Lang }) {
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
            {t(lang, "rights.askLabel")}
          </p>
          <VoiceDictationButton
            defaultLang={lang === "hi" ? "hi-IN" : "en-IN"}
            onTranscript={(text) => setQuestion((prev) => (prev ? prev + " " + text : text))}
          />
        </div>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder={t(lang, "rights.placeholder")}
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
          {pending ? t(lang, "rights.checking") : t(lang, "rights.ask")}
        </button>
      </div>

      {answer && answer.status === "no_source" && (
        <div className="border-2 p-6" style={{ borderColor: "var(--gilt)", background: "var(--gilt-tint)" }}>
          <p className="font-mono text-xs uppercase tracking-wide mb-2" style={{ color: "var(--gilt)" }}>
            {t(lang, "rights.noSourceTitle")}
          </p>
          <p className="mb-3" style={{ color: "var(--ink)" }}>
            {t(lang, "rights.noSourceBody")}
          </p>
          <p className="text-sm mb-2" style={{ color: "var(--ink-soft)" }}>{t(lang, "rights.whatWeCover")}</p>
          <ul className="text-sm list-disc list-inside space-y-1" style={{ color: "var(--ink-soft)" }}>
            {answer.coveredTopics.map((topic) => <li key={topic}>{topic}</li>)}
          </ul>
        </div>
      )}

      {answer && answer.status === "answered" && (
        <div className="space-y-4">
          {answer.plainLanguage && (
            <div className="border-2 p-5" style={{ borderColor: "var(--forest)", background: "var(--forest-tint)" }}>
              <p className="font-mono text-xs uppercase tracking-wide mb-2" style={{ color: "var(--forest)" }}>
                {t(lang, "rights.inPlainLanguage")}
              </p>
              <p style={{ color: "var(--ink)" }}>{answer.plainLanguage.text}</p>
            </div>
          )}

          <div className="space-y-3">
            {answer.chunks.map((chunk) => (
              <div key={chunk.id} className="border p-4" style={{ borderColor: "var(--rule-strong)" }}>
                <p className="font-mono text-xs mb-1" style={{ color: "var(--seal-deep)" }}>
                  {chunk.act}, {chunk.section} <CitationTag citationId={chunk.id} label={t(lang, "rights.readTheText")} />
                </p>
                <p className="font-medium mb-2" style={{ color: "var(--ink)" }}>{chunk.heading}</p>
                {chunk.note && (
                  <p className="text-sm" style={{ color: "var(--ink-soft)" }}>{chunk.note}</p>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)" }}>
            {t(lang, "rights.boundaryLine")}
          </p>

          <button
            type="button"
            onClick={handleGetTheRecord}
            className="border-2 px-6 py-3 font-body font-semibold"
            style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
          >
            {t(lang, "rights.getTheRecord")}
          </button>
        </div>
      )}
    </div>
  );
}
