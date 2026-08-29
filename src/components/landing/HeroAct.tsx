import Link from "next/link";
import { CitationTag } from "@/components/CitationTag";
import { CountUp } from "@/components/landing/CountUp";
import { Reveal } from "@/components/landing/Reveal";
import { DOLR_EVIDENCE } from "@/lib/data/evidence";

export function HeroAct() {
  const returnedPct = Math.round(DOLR_EVIDENCE.returnedShare * 100);

  return (
    <section
      className="paper-grain relative border-b-2 overflow-hidden"
      style={{ borderColor: "var(--ink)" }}
    >
      <ScalesMark />
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start relative">
        <div>
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--gilt)" }}>
              One citizen, four disconnected tools
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1
              className="font-display font-bold text-5xl leading-[1.05] mb-6"
              style={{ color: "var(--ink)", fontVariationSettings: '"WONK" 1, "SOFT" 0' }}
            >
              You do not have a records problem. You have a government problem, and it was
              never one question.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "var(--ink-soft)" }}>
              A citizen with a real grievance is usually asking four questions at once: am I
              even eligible for something here, what are my rights in this situation, which
              government is actually responsible, and can I produce a document that survives
              contact with a bureaucracy. Today those four questions live in four separate
              places that do not talk to each other. Adhikaar signs a citizen in once and
              answers all four in one continuous flow, checking eligibility, explaining rights,
              deciding jurisdiction and legality, then drafting the application and watching
              the statutory clock until it answers or misses.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/start"
                className="border-2 px-6 py-3 font-body font-semibold panel-lift transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                style={{ background: "var(--seal)", borderColor: "var(--ink)", color: "var(--paper)" }}
              >
                Start with what went wrong
              </Link>
              <Link
                href="/methodology"
                className="border-2 px-6 py-3 font-body font-semibold transition-colors hover:bg-[var(--paper-raised)]"
                style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
              >
                Read the methodology
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="relative">
            <div
              aria-hidden
              className="absolute border-2"
              style={{ inset: 0, top: 7, left: 7, borderColor: "var(--ink)", background: "var(--gilt)" }}
            />
            <div className="relative border-2 p-6" style={{ borderColor: "var(--ink)", background: "var(--paper-raised)" }}>
              <p className="font-mono text-xs uppercase tracking-[0.15em] mb-3" style={{ color: "var(--seal-deep)" }}>
                From the government&rsquo;s own disclosure register
              </p>
              <p className="font-display font-bold text-6xl leading-none mb-2" style={{ color: "var(--seal)" }}>
                <CountUp to={DOLR_EVIDENCE.returned} />
                <span className="text-2xl align-top ml-1" style={{ color: "var(--ink-faint)" }}>
                  / {DOLR_EVIDENCE.totalApplications.toLocaleString("en-IN")}
                </span>
              </p>
              <p className="mb-4" style={{ color: "var(--ink-soft)" }}>
                applications in the Department of Land Resources&rsquo; own published register,{" "}
                {returnedPct} percent of the total, were returned to the applicant unanswered,
                not refused, returned, with no refund of the fee.
              </p>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--ink-soft)" }}>
                The department states the reason itself: a Central Public Information Officer
                receiving a State subject, most often a land record, is not required to
                transfer it. It is simply sent back.
              </p>
              <CitationTag citationId="rti-6-3" label="Read the rule that makes this happen" />
              <p className="text-xs mt-3 pt-3 border-t" style={{ borderColor: "var(--rule)", color: "var(--ink-faint)" }}>
                Land is the subject of this particular department almost entirely, which is a
                State matter. This figure is not a national rate and should not be read as one.
                It is direct evidence of a specific failure, not a general statistic. Source:{" "}
                {DOLR_EVIDENCE.sourceLabel}.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// A faint scales-of-justice mark, drawn once as inline SVG so it costs
// nothing and needs no asset pipeline. Sits behind the headline column
// at very low opacity: a visual anchor for "law and order" that
// typography alone cannot carry.
function ScalesMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 400"
      className="absolute pointer-events-none select-none"
      style={{ right: -60, top: -40, width: 460, height: 460, opacity: 0.05, color: "var(--ink)" }}
    >
      <line x1="200" y1="30" x2="200" y2="340" stroke="currentColor" strokeWidth="6" />
      <line x1="70" y1="90" x2="330" y2="90" stroke="currentColor" strokeWidth="6" />
      <circle cx="200" cy="30" r="10" fill="currentColor" />
      <line x1="70" y1="90" x2="30" y2="180" stroke="currentColor" strokeWidth="5" />
      <line x1="70" y1="90" x2="110" y2="180" stroke="currentColor" strokeWidth="5" />
      <path d="M 30 180 A 40 40 0 0 0 110 180 Z" fill="none" stroke="currentColor" strokeWidth="5" />
      <line x1="330" y1="90" x2="290" y2="180" stroke="currentColor" strokeWidth="5" />
      <line x1="330" y1="90" x2="370" y2="180" stroke="currentColor" strokeWidth="5" />
      <path d="M 290 180 A 40 40 0 0 0 370 180 Z" fill="none" stroke="currentColor" strokeWidth="5" />
      <rect x="150" y="340" width="100" height="16" fill="currentColor" />
      <path d="M 170 340 L 200 300 L 230 340 Z" fill="currentColor" />
    </svg>
  );
}
