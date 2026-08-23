import { Reveal } from "@/components/landing/Reveal";

const STEPS = [
  {
    n: "1",
    title: "Is this even a records request?",
    body: "A citizen asking for a refund, a wage payment, or an eviction to stop does not need a Right to Information application. Remedy triage names the correct forum, computes consumer jurisdiction where relevant, and stops rather than drafting a document that cannot deliver what was asked for.",
  },
  {
    n: "2",
    title: "Which government, and which office?",
    body: "Jurisdiction triage classifies the subject matter against the Constitution's Seventh Schedule, Union, State or Concurrent, before an authority is ever suggested. If the case is a State subject and a Central authority is selected, it blocks the choice and explains why, citing the exact rule.",
  },
  {
    n: "3",
    title: "Will this question survive a refusal?",
    body: "Every drafted question is checked against a rule engine built from the Act's own exemptions and definitions, eighteen rules in total, each one citing its section. An opinion-seeking question is rewritten as a records request before it is ever posted.",
  },
  {
    n: "4",
    title: "What happens if nobody answers?",
    body: "Once filed, the statutory clock runs on its own. If the thirty-day window lapses, the case becomes a deemed refusal and the First Appeal is drafted automatically, citing the free-of-cost provision, with no further input required.",
  },
];

export function ProcessAct() {
  return (
    <section className="paper-grain relative border-b" style={{ borderColor: "var(--rule)" }}>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <h2 className="font-display font-semibold mb-2" style={{ color: "var(--ink)", fontSize: "var(--step-3)" }}>
            What happens before a document is written
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mb-14 max-w-2xl" style={{ color: "var(--ink-soft)", fontSize: "var(--step-0)" }}>
            Four checks run in sequence, each one deterministic and citable. None of them
            depend on a language model reaching a verdict, because a verdict about what the law
            permits is not something a model is entitled to make on its own.
          </p>
        </Reveal>

        <ol className="relative">
          <div
            className="hidden md:block absolute top-0 bottom-0"
            style={{ left: 27, width: 2, background: "var(--rule)" }}
            aria-hidden
          />
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.06}>
              <li className="relative flex gap-6 pb-12 last:pb-0 list-none">
                <div
                  className="relative z-10 shrink-0 border-2 flex items-center justify-center font-display font-bold"
                  style={{
                    width: 56,
                    height: 56,
                    borderColor: "var(--ink)",
                    background: "var(--paper)",
                    color: "var(--seal)",
                    fontSize: "1.4rem",
                  }}
                >
                  {step.n}
                </div>
                <div className="pt-2">
                  <h3 className="font-display font-semibold text-xl mb-2" style={{ color: "var(--ink)" }}>
                    {step.title}
                  </h3>
                  <p className="leading-relaxed max-w-xl" style={{ color: "var(--ink-soft)" }}>
                    {step.body}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
