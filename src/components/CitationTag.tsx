"use client";

import { useState } from "react";
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

export function CitationTag({ citationId, label }: { citationId: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const chunk = tryResolveCitation(citationId);

  if (!chunk) {
    return (
      <span
        className="cite font-mono"
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
        aria-expanded={open}
      >
        {label ?? `§ ${chunk.section}`}
      </button>
      {open && (
        <span
          className="mt-2 mb-3 block max-w-xl border p-4 text-sm leading-relaxed"
          style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)", color: "var(--ink-soft)" }}
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
        </span>
      )}
    </span>
  );
}
