import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "";

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
            You review it before it is posted. That review is not a formality this product
            tries to shrink; it is the point at which you, not a model, take responsibility for
            what is filed.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Link
            href="/start"
            className="border-2 px-8 py-3 font-body font-semibold inline-block transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--foil)", borderColor: "var(--foil)", color: "var(--paper-endpaper)" }}
          >
            Start with what went wrong
          </Link>
        </Reveal>
        {DEMO_EMAIL && (
          <Reveal delay={0.14}>
            <div
              className="border mx-auto mt-8 max-w-sm p-4 text-sm"
              style={{ borderColor: "var(--foil-dim)", background: "rgba(0,0,0,0.15)" }}
            >
              <p className="mb-1" style={{ color: "var(--ink-on-dark-soft)" }}>
                Demo citizen account, no signup needed:
              </p>
              <p className="font-mono select-all" style={{ color: "var(--ink-on-dark)" }}>
                {DEMO_EMAIL}
              </p>
              {DEMO_PASSWORD && (
                <p className="font-mono select-all" style={{ color: "var(--ink-on-dark)" }}>
                  {DEMO_PASSWORD}
                </p>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
