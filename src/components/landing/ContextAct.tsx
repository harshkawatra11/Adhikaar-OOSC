import { Reveal } from "@/components/landing/Reveal";
import { NATIONAL_CONTEXT } from "@/lib/data/evidence";

export function ContextAct() {
  return (
    <section className="paper-grain relative border-b" style={{ borderColor: "var(--rule)" }}>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <h2 className="font-display font-semibold mb-10" style={{ color: "var(--ink)", fontSize: "var(--step-3)" }}>
            This is not one department&rsquo;s problem
          </h2>
        </Reveal>
        <div className="space-y-0">
          {NATIONAL_CONTEXT.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.08}>
              <div
                className="grid gap-4 md:grid-cols-[220px_1fr] items-start py-6"
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--rule)" }}
              >
                <p className="font-display font-bold" style={{ color: "var(--gilt)", fontSize: "var(--step-3)" }}>
                  {item.value}
                </p>
                <div>
                  <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>
                    {item.label}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                    {item.detail}
                  </p>
                </div>
              </div>
              <div className="rule-gilt" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
