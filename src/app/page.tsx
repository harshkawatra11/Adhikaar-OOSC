import Link from "next/link";
import { DOLR_EVIDENCE, NATIONAL_CONTEXT, CSC_CONTEXT } from "@/lib/data/evidence";
import { CitationTag } from "@/components/CitationTag";
import { DIRECTORY_COVERAGE_STATEMENT } from "@/lib/data/authorities";

export default function HomePage() {
  const returnedPct = Math.round(DOLR_EVIDENCE.returnedShare * 100);

  return (
    <div>
      {/* Hero */}
      <section className="border-b-2" style={{ borderColor: "var(--ink)" }}>
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--gilt)" }}>
              A jurisdiction-aware RTI workbench
            </p>
            <h1 className="font-display font-bold text-5xl leading-[1.05] mb-6" style={{ color: "var(--ink)" }}>
              Most rejected applications were never wrong. They were addressed to the wrong government.
            </h1>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "var(--ink-soft)" }}>
              Adhikaar is built for the people who file Right to Information applications for others: Common
              Service Centre operators, legal aid volunteers, RTI activists. Before it drafts anything, it decides
              whether the authority you have chosen can actually answer the question. Then it runs the statutory
              clock, and drafts the appeal the day the authority misses it.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/docket/new"
                className="border-2 px-6 py-3 font-body font-semibold"
                style={{ background: "var(--seal)", borderColor: "var(--ink)", color: "var(--paper)" }}
              >
                Open a new case
              </Link>
              <Link
                href="/methodology"
                className="border-2 px-6 py-3 font-body font-semibold"
                style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
              >
                Read the methodology
              </Link>
            </div>
          </div>

          <div className="border-2 p-6" style={{ borderColor: "var(--ink)", background: "var(--paper-raised)" }}>
            <p className="font-mono text-xs uppercase tracking-[0.15em] mb-3" style={{ color: "var(--seal-deep)" }}>
              From the government&rsquo;s own disclosure register
            </p>
            <p className="font-display font-bold text-6xl leading-none mb-2" style={{ color: "var(--seal)" }}>
              {DOLR_EVIDENCE.returned.toLocaleString("en-IN")}
              <span className="text-2xl align-top ml-1" style={{ color: "var(--ink-faint)" }}>
                / {DOLR_EVIDENCE.totalApplications.toLocaleString("en-IN")}
              </span>
            </p>
            <p className="mb-4" style={{ color: "var(--ink-soft)" }}>
              applications in the Department of Land Resources&rsquo; own published register, {returnedPct} percent
              of the total, were returned to the applicant unanswered, not refused, returned, with no refund of the
              fee.
            </p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--ink-soft)" }}>
              The department states the reason itself: a Central Public Information Officer receiving a State
              subject, most often a land record, is not required to transfer it. It is simply sent back.
            </p>
            <CitationTag citationId="rti-6-3" label="Read the rule that makes this happen" />
            <p className="text-xs mt-3 pt-3 border-t" style={{ borderColor: "var(--rule)", color: "var(--ink-faint)" }}>
              Land is the subject of this particular department almost entirely, which is a State matter. This
              figure is not a national rate and should not be read as one. It is direct evidence of a specific
              failure, not a general statistic. Source: {DOLR_EVIDENCE.sourceLabel}.
            </p>
          </div>
        </div>
      </section>

      {/* National context */}
      <section className="border-b" style={{ borderColor: "var(--rule)" }}>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="font-display font-semibold text-2xl mb-6" style={{ color: "var(--ink)" }}>
            This is not one department&rsquo;s problem
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {NATIONAL_CONTEXT.map((item) => (
              <div key={item.label} className="border p-5" style={{ borderColor: "var(--rule-strong)" }}>
                <p className="font-display font-bold text-3xl mb-2" style={{ color: "var(--gilt)" }}>
                  {item.value}
                </p>
                <p className="font-medium mb-2 text-sm" style={{ color: "var(--ink)" }}>
                  {item.label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b" style={{ borderColor: "var(--rule)" }}>
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="font-display font-semibold text-2xl mb-2" style={{ color: "var(--ink)" }}>
            What happens before a document is written
          </h2>
          <p className="mb-8 max-w-2xl" style={{ color: "var(--ink-soft)" }}>
            Four checks run in sequence, each one deterministic and citable. None of them depend on a language
            model reaching a verdict, because a verdict about what the law permits is not something a model is
            entitled to make on its own.
          </p>
          <ol className="grid gap-6 md:grid-cols-2">
            <StepCard
              n="1"
              title="Is this even a records request?"
              body="A citizen asking for a refund, a wage payment, or an eviction to stop does not need a Right to Information application. Remedy triage names the correct forum, computes consumer jurisdiction where relevant, and stops rather than drafting a document that cannot deliver what was asked for."
            />
            <StepCard
              n="2"
              title="Which government, and which office?"
              body="Jurisdiction triage classifies the subject matter against the Constitution's Seventh Schedule, Union, State or Concurrent, before an authority is ever suggested. If the case is a State subject and a Central authority is selected, it blocks the choice and explains why, citing the exact rule."
            />
            <StepCard
              n="3"
              title="Will this question survive a refusal?"
              body="Every drafted question is checked against a rule engine built from the Act's own exemptions and definitions, eighteen rules in total, each one citing its section. An opinion-seeking question is rewritten as a records request before it is ever posted."
            />
            <StepCard
              n="4"
              title="What happens if nobody answers?"
              body="Once filed, the statutory clock runs on its own. If the thirty-day window lapses, the case becomes a deemed refusal and the First Appeal is drafted automatically, citing the free-of-cost provision, with no further input required."
            />
          </ol>
        </div>
      </section>

      {/* Coverage honesty */}
      <section className="border-b" style={{ borderColor: "var(--rule)" }}>
        <div className="mx-auto max-w-6xl px-6 py-12 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display font-semibold text-xl mb-3" style={{ color: "var(--ink)" }}>
              Who this is for
            </h2>
            <p className="leading-relaxed mb-3" style={{ color: "var(--ink-soft)" }}>
              Adhikaar is built for the person who files these applications for other people, not for a single
              citizen filing once. India&rsquo;s Common Service Centre network alone runs to roughly{" "}
              {CSC_CONTEXT.functionalCentres} functional centres and {CSC_CONTEXT.vles} village level entrepreneurs,
              reaching {CSC_CONTEXT.gramPanchayatCoverage}. A tool that helps one of these operators serves dozens
              of citizens who would otherwise never use a web form themselves.
            </p>
            <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
              Source: Common Services Centres Scheme, Ministry of Electronics and Information Technology.
            </p>
          </div>
          <div>
            <h2 className="font-display font-semibold text-xl mb-3" style={{ color: "var(--ink)" }}>
              Where coverage stops
            </h2>
            <p className="leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              {DIRECTORY_COVERAGE_STATEMENT} Where a case falls outside that coverage, the honest answer is to say
              so, not to guess an address and let the applicant lose their fee finding out the hard way.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-14 text-center">
          <h2 className="font-display font-bold text-3xl mb-4" style={{ color: "var(--ink)" }}>
            Every document Adhikaar produces is a draft.
          </h2>
          <p className="max-w-2xl mx-auto mb-8" style={{ color: "var(--ink-soft)" }}>
            An operator reviews it before it is posted. That review is not a formality this product tries to
            shrink; it is the point at which a human, not a model, takes responsibility for what is filed.
          </p>
          <Link
            href="/docket/new"
            className="border-2 px-8 py-3 font-body font-semibold inline-block"
            style={{ background: "var(--seal)", borderColor: "var(--ink)", color: "var(--paper)" }}
          >
            Open a new case
          </Link>
        </div>
      </section>
    </div>
  );
}

function StepCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="border p-6 list-none" style={{ borderColor: "var(--rule-strong)" }}>
      <span className="font-mono text-xs" style={{ color: "var(--gilt)" }}>
        {n.padStart(2, "0")}
      </span>
      <h3 className="font-display font-semibold text-lg mt-1 mb-2" style={{ color: "var(--ink)" }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        {body}
      </p>
    </li>
  );
}
