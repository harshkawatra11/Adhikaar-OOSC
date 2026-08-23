import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";

export function HeroAct() {
  return (
    <section
      className="paper-grain relative border-b-2 min-h-[92vh] flex items-center"
      style={{ borderColor: "var(--ink)" }}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 w-full">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.24em] mb-6" style={{ color: "var(--gilt)" }}>
            A jurisdiction-aware RTI workbench
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1
            className="font-display font-bold leading-[0.98] mb-8 max-w-4xl"
            style={{ color: "var(--ink)", fontSize: "var(--step-6)", fontVariationSettings: '"WONK" 1, "SOFT" 0' }}
          >
            Most rejected applications were never wrong. They were addressed to the wrong
            government.
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p
            className="leading-relaxed mb-10 max-w-2xl"
            style={{ color: "var(--ink-soft)", fontSize: "var(--step-1)" }}
          >
            Adhikaar is built for the people who file Right to Information applications for
            others: Common Service Centre operators, legal aid volunteers, RTI activists.
            Before it drafts anything, it decides whether the authority you have chosen can
            actually answer the question. Then it runs the statutory clock, and drafts the
            appeal the day the authority misses it.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/docket/new"
              className="border-2 px-7 py-3.5 font-body font-semibold panel-lift transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              style={{ background: "var(--seal)", borderColor: "var(--ink)", color: "var(--paper)" }}
            >
              Open a new case
            </Link>
            <Link
              href="/methodology"
              className="border-2 px-7 py-3.5 font-body font-semibold transition-colors hover:bg-[var(--paper-raised)]"
              style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
            >
              Read the methodology
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
