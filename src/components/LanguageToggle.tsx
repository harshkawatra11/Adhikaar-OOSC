"use client";

import { LANG_COOKIE, type Lang } from "@/lib/i18n/dictionary";

// Sets the cookie directly and does a full reload rather than a
// client-side router transition: the pages that read language
// (start/rights/schemes) are Server Components that read the cookie
// once at render and hand the resolved Lang down as a prop to their
// client-side interview/wizard, the same pattern getSession() already
// uses for auth. A soft navigation would leave already-mounted client
// components on the old language until their own state happened to
// re-render for an unrelated reason.
export function LanguageToggle({ current }: { current: Lang }) {
  function setLang(lang: Lang) {
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  }

  return (
    <div className="flex border" style={{ borderColor: "var(--rule-strong)" }}>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={current === "en"}
        className="px-2 py-1 text-xs font-mono"
        style={current === "en" ? { background: "var(--gilt)", color: "var(--paper)" } : { color: "var(--ink-faint)" }}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("hi")}
        aria-pressed={current === "hi"}
        className="px-2 py-1 text-xs font-mono font-devanagari"
        style={current === "hi" ? { background: "var(--gilt)", color: "var(--paper)" } : { color: "var(--ink-faint)" }}
      >
        हि
      </button>
    </div>
  );
}
