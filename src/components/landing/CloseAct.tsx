import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";

export function CloseAct() {
  return (
    <section className="act-dark paper-grain relative">
      <div className="mx-auto max-w-6xl px-6 py-14 text-center">
        <Reveal>
          <h2 className="font-display font-bold text-3xl mb-4" style={{ color: "var(--ink-on-dark)" }}>
            Every document Adhikaar produces is a draft.
          </h2>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="max-w-2xl mx-auto mb-8" style={{ color: "var(--ink-on-dark-soft)" }}>
            An operator reviews it before it is posted. That review is not a formality this
            product tries to shrink; it is the point at which a human, not a model, takes
            responsibility for what is filed.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Link
            href="/start"
            className="border-2 px-8 py-3 font-body font-semibold inline-block transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--foil)", borderColor: "var(--foil)", color: "var(--paper-endpaper)" }}
          >
            Open a new case
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
