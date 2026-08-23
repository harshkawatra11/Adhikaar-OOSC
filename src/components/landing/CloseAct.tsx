import Link from "next/link";
import { Seal } from "@/components/Seal";
import { Reveal } from "@/components/landing/Reveal";

export function CloseAct() {
  return (
    <section className="act-dark paper-grain relative">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center flex flex-col items-center">
        <Reveal>
          <Seal size={56} tone="dark" />
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            className="font-display font-bold mt-8 mb-5"
            style={{ color: "var(--ink-on-dark)", fontSize: "var(--step-4)" }}
          >
            Every document Adhikaar produces is a draft.
          </h2>
        </Reveal>
        <Reveal delay={0.14}>
          <p
            className="max-w-xl mb-10 leading-relaxed"
            style={{ color: "var(--ink-on-dark-soft)", fontSize: "var(--step-1)" }}
          >
            An operator reviews it before it is posted. That review is not a formality this
            product tries to shrink; it is the point at which a human, not a model, takes
            responsibility for what is filed.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <Link
            href="/docket/new"
            className="border-2 px-8 py-3.5 font-body font-semibold inline-block transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--foil)", borderColor: "var(--foil)", color: "var(--paper-endpaper)" }}
          >
            Open a new case
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
