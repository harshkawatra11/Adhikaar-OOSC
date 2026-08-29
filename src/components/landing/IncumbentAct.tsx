import { Reveal } from "@/components/landing/Reveal";

const PORTAL_STRENGTHS = [
  "Real, modern payment rails: net banking, UPI, and cards",
  "A working BPL fee exemption",
  "SMS status alerts once a case is registered",
  "A published help desk for problems with the portal itself",
];

const PORTAL_GAPS = [
  {
    title: "No real account",
    body: "The portal's own FAQ says registration is optional. A case is tracked only by a registration number plus a typed email, and the portal states it retains RTI cases for just three years.",
  },
  {
    title: "No help finding the right government",
    body: "The portal covers Central authorities only, and says so. It does not ask what happened to the citizen and work out who is responsible. Addressed to the wrong government, an application is returned, not forwarded, no refund, under a real 2008 government office memorandum. That exact mechanism is what Adhikaar's jurisdiction check exists to catch before filing.",
  },
  {
    title: "One 3,000-character box, no drafting help",
    body: "A blank text field with a hard character limit and no guidance on what a Public Information Officer is legally required to act on.",
  },
  {
    title: "Total silence after submission",
    body: "Nothing tracks the statutory thirty-day clock, and nothing tells the citizen when a deemed refusal opens the window to appeal.",
  },
];

export function IncumbentAct() {
  return (
    <section className="act-dark paper-grain relative border-b-2" style={{ borderColor: "var(--ink)" }}>
      <div className="mx-auto max-w-6xl px-6 py-14 relative">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "var(--foil)" }}>
            The incumbent, honestly
          </p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="font-display font-bold text-3xl mb-3" style={{ color: "var(--ink-on-dark)" }}>
            rtionline.gov.in already exists. It is real, and it works.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-3xl mb-10 leading-relaxed" style={{ color: "var(--ink-on-dark-soft)" }}>
            The Government of India&rsquo;s own RTI Online Portal is not a strawman. It gets real
            things right that a new product should say plainly rather than pretend do not exist.
          </p>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-2">
          <Reveal delay={0.1}>
            <div className="border-2 h-full p-6" style={{ borderColor: "var(--foil-dim)" }}>
              <h3 className="font-display font-semibold text-lg mb-4" style={{ color: "var(--foil)" }}>
                What rtionline.gov.in gets right
              </h3>
              <ul className="space-y-3">
                {PORTAL_STRENGTHS.map((item) => (
                  <li key={item} className="text-sm leading-relaxed pl-4 relative" style={{ color: "var(--ink-on-dark-soft)" }}>
                    <span className="absolute left-0" style={{ color: "var(--foil)" }}>
                      +
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="border-2 h-full p-6" style={{ borderColor: "var(--ink-on-dark)" }}>
              <h3 className="font-display font-semibold text-lg mb-4" style={{ color: "var(--ink-on-dark)" }}>
                What it leaves a citizen holding
              </h3>
              <div className="space-y-4">
                {PORTAL_GAPS.map((gap) => (
                  <div key={gap.title} className="border-t pt-3" style={{ borderColor: "var(--foil-dim)" }}>
                    <p className="font-medium text-sm mb-1" style={{ color: "var(--ink-on-dark)" }}>
                      {gap.title}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--ink-on-dark-soft)" }}>
                      {gap.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.18}>
          <p className="mt-8 text-sm leading-relaxed max-w-3xl" style={{ color: "var(--ink-on-dark-soft)" }}>
            Adhikaar is not a replacement for the portal&rsquo;s payment rails or its help desk.
            It is what a citizen needs before and after that box: an account that remembers the
            case, a jurisdiction check before the wrong office sends it back, help drafting the
            question itself, and a clock that keeps running after the portal goes quiet.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
