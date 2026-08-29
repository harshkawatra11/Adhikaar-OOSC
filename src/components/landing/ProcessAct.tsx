import { Reveal } from "@/components/landing/Reveal";

const STEPS = [
  {
    n: "1",
    question: "Am I even eligible for something here?",
    title: "Scheme Eligibility Reader",
    body: "Answers a citizen's eligibility questions in plain language before anything is filed, and hands off into the interview the moment a records request or an application is what comes next.",
    handoff: "hands off into",
  },
  {
    n: "2",
    question: "What are my rights in this situation?",
    title: "Rights Navigator",
    body: "Grounded statute Q&A: what a citizen can do, in their own words, cited back to the actual section. Where the answer is \"file a records request,\" it hands off directly into the guided interview.",
    handoff: "hands off into",
  },
  {
    n: "3",
    question: "Is this the correct authority, and is my question legally sound?",
    title: "Jurisdiction and legality, inside the interview",
    body: "The guided interview classifies the subject matter against the Constitution's Seventh Schedule before an authority is ever suggested, and checks every drafted question against an eighteen-rule linter built from the Act's own exemptions, each rule citing its section. A State subject addressed to a Central authority is blocked, not filed.",
    handoff: "feeds",
  },
  {
    n: "4",
    question: "Can I produce the document, and will I know if they go silent?",
    title: "Drafting and the statutory clock",
    body: "A properly formatted application is generated, then the statutory clock runs on its own. If the thirty-day window lapses, the case becomes a deemed refusal and the First Appeal is drafted automatically, citing the free-of-cost provision, with no further input required.",
    handoff: null,
  },
];

export function ProcessAct() {
  return (
    <section className="border-b" style={{ borderColor: "var(--rule)" }}>
      <div className="mx-auto max-w-6xl px-6 py-14">
        <Reveal>
          <h2 className="font-display font-semibold text-2xl mb-2" style={{ color: "var(--ink)" }}>
            One journey, not four separate tools
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mb-8 max-w-2xl" style={{ color: "var(--ink-soft)" }}>
            Each of these answers exactly one question a citizen actually has, and each one
            hands off into the next rather than leaving the citizen to start over somewhere
            else. None of the deciding steps depend on a language model reaching a verdict,
            because a verdict about what the law permits is not something a model is entitled
            to make on its own.
          </p>
        </Reveal>
        <ol className="grid gap-0 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.05}>
              <li className="border p-6 list-none h-full flex flex-col" style={{ borderColor: "var(--rule-strong)" }}>
                <span className="font-mono text-xs" style={{ color: "var(--gilt)" }}>
                  {step.n.padStart(2, "0")}
                </span>
                <p className="text-xs italic mt-2 mb-2" style={{ color: "var(--ink-faint)" }}>
                  &ldquo;{step.question}&rdquo;
                </p>
                <h3 className="font-display font-semibold text-base mb-2" style={{ color: "var(--ink)" }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed mb-3 flex-1" style={{ color: "var(--ink-soft)" }}>
                  {step.body}
                </p>
                {step.handoff && (
                  <p className="font-mono text-xs uppercase tracking-wide mt-auto pt-2 border-t" style={{ borderColor: "var(--rule)", color: "var(--seal-deep)" }}>
                    {step.handoff} step {String(i + 2).padStart(2, "0")} &rarr;
                  </p>
                )}
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
