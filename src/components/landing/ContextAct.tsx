import { Reveal } from "@/components/landing/Reveal";
import { NATIONAL_CONTEXT } from "@/lib/data/evidence";

export function ContextAct() {
  return (
    <section className="border-b" style={{ borderColor: "var(--rule)" }}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Reveal>
          <h2 className="font-display font-semibold text-2xl mb-6" style={{ color: "var(--ink)" }}>
            This is not one department&rsquo;s problem
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {NATIONAL_CONTEXT.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.06}>
              <div className="border p-5 h-full" style={{ borderColor: "var(--rule-strong)" }}>
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
