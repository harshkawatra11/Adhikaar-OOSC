import { CitationTag } from "@/components/CitationTag";
import { CountUp } from "@/components/landing/CountUp";
import { Reveal } from "@/components/landing/Reveal";
import { DOLR_EVIDENCE } from "@/lib/data/evidence";

export function EvidenceAct() {
  const returnedPct = Math.round(DOLR_EVIDENCE.returnedShare * 100);

  return (
    <section className="act-dark paper-grain relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p
            className="font-mono text-xs uppercase tracking-[0.24em] mb-6"
            style={{ color: "var(--foil)" }}
          >
            From the government&rsquo;s own disclosure register
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <p
            className="font-display font-bold leading-none mb-4"
            style={{ color: "var(--foil)", fontSize: "var(--step-6)" }}
          >
            <CountUp to={DOLR_EVIDENCE.returned} />
            <span className="align-top ml-3" style={{ color: "var(--ink-on-dark-soft)", fontSize: "var(--step-3)" }}>
              / {DOLR_EVIDENCE.totalApplications.toLocaleString("en-IN")}
            </span>
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rule-gilt mb-8" style={{ maxWidth: 420 }} />
        </Reveal>

        <Reveal delay={0.14}>
          <p
            className="leading-relaxed mb-6 max-w-2xl"
            style={{ color: "var(--ink-on-dark)", fontSize: "var(--step-1)" }}
          >
            applications in the Department of Land Resources&rsquo; own published register,{" "}
            <strong style={{ color: "var(--foil)" }}>{returnedPct} percent</strong> of the
            total, were returned to the applicant unanswered, not refused, returned, with no
            refund of the fee.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-sm leading-relaxed mb-4 max-w-2xl" style={{ color: "var(--ink-on-dark-soft)" }}>
            The department states the reason itself: a Central Public Information Officer
            receiving a State subject, most often a land record, is not required to transfer
            it. It is simply sent back.
          </p>
        </Reveal>

        <Reveal delay={0.26}>
          <CitationTag citationId="rti-6-3" label="Read the rule that makes this happen" tone="dark" />
        </Reveal>

        <Reveal delay={0.3}>
          <p
            className="text-xs mt-6 pt-4 border-t max-w-2xl"
            style={{ borderColor: "var(--foil-dim)", color: "var(--ink-on-dark-soft)" }}
          >
            Land is the subject of this particular department almost entirely, which is a
            State matter. This figure is not a national rate and should not be read as one. It
            is direct evidence of a specific failure, not a general statistic. Source:{" "}
            {DOLR_EVIDENCE.sourceLabel}.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
