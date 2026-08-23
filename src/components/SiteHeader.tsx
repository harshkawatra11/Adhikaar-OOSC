import Link from "next/link";
import { Seal } from "@/components/Seal";
import { GithubMark } from "@/components/GithubMark";

export function SiteHeader() {
  return (
    <header className="border-b-2" style={{ borderColor: "var(--ink)", background: "var(--paper)" }}>
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <Seal size={36} />
          <div className="leading-tight">
            <div className="font-display font-bold text-xl tracking-tight" style={{ color: "var(--ink)" }}>
              Adhikaar
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--ink-faint)" }}>
              A Register of Applications
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-6 font-body text-sm">
          <Link href="/docket" className="hover:underline" style={{ color: "var(--ink-soft)" }}>
            Docket
          </Link>
          <Link href="/docket/new" className="hover:underline" style={{ color: "var(--ink-soft)" }}>
            New Case
          </Link>
          <Link href="/methodology" className="hover:underline" style={{ color: "var(--ink-soft)" }}>
            Methodology
          </Link>
          <a
            href="https://github.com/harshkawatra11/Adhikaar-OOSC"
            className="github-btn border-2 flex items-center gap-2 px-3 py-1.5 font-body text-sm font-semibold transition-colors"
            style={{ borderColor: "var(--ink)", background: "var(--ink)", color: "var(--paper)" }}
            target="_blank"
            rel="noreferrer"
          >
            <GithubMark size={16} />
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
