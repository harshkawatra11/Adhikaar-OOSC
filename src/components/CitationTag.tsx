"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { tryResolveCitation } from "@/lib/citations";

// The render gate, applied. If a citation id does not resolve to real
// corpus text, this component renders a visible defect marker instead of
// silently dropping the claim or, worse, showing an unsourced assertion.
// A missing citation should be loud during development, not invisible in
// production.
//
// Built from a button and an inline span rather than details/summary so
// it stays valid HTML when a caller places it inside a <p>, which several
// callers do; details is flow content and is not permitted inside p.

export function CitationTag({
  citationId,
  label,
  tone = "light",
}: {
  citationId: string;
  label?: string;
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const chunk = tryResolveCitation(citationId);
  const reduceMotion = useReducedMotion();

  if (!chunk) {
    return (
      <span
        className="cite cite-unresolved font-mono"
        style={{ borderBottomColor: "var(--brick)", color: "var(--brick)" }}
        title="Unresolved citation: this claim has no corpus text behind it and should not have shipped."
      >
        [unresolved: {citationId}]
      </span>
    );
  }

  return (
    <span className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cite font-mono"
        style={
          tone === "dark"
            ? { color: "var(--foil)", borderBottomColor: "var(--foil-dim)" }
            : undefined
        }
        aria-expanded={open}
      >
        {label ?? `§ ${chunk.section}`}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.span
            className="mt-2 mb-3 block max-w-xl border p-4 text-sm leading-relaxed overflow-hidden"
            style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)", color: "var(--ink-soft)" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="block font-mono text-xs mb-2" style={{ color: "var(--seal-deep)" }}>
              {chunk.act}, Section {chunk.section}
            </span>
            <span className="block font-medium mb-2" style={{ color: "var(--ink)" }}>{chunk.heading}</span>
            <span className="block italic">&ldquo;{chunk.text}&rdquo;</span>
            {chunk.note && (
              <span className="block mt-3 pt-3 border-t" style={{ borderColor: "var(--rule)" }}>
                {chunk.note}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
