import { Reveal } from "@/components/landing/Reveal";
import { CSC_CONTEXT } from "@/lib/data/evidence";
import { DIRECTORY_COVERAGE_STATEMENT } from "@/lib/data/authorities";

export function CoverageAct() {
  return (
    <section className="border-b" style={{ borderColor: "var(--rule)" }}>
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-8 md:grid-cols-2">
        <Reveal>
          <h2 className="font-display font-semibold text-xl mb-3" style={{ color: "var(--ink)" }}>
            Who this is for
          </h2>
          <p className="leading-relaxed mb-3" style={{ color: "var(--ink-soft)" }}>
            Adhikaar is built for the citizen with the actual grievance, signed in under their
            own account, from the first question to the drafted document. It also works well
            through a second channel: Common Service Centre operators and legal aid volunteers
            who file on someone else&rsquo;s behalf. India&rsquo;s Common Service Centre network
            alone runs to roughly {CSC_CONTEXT.functionalCentres} functional centres and{" "}
            {CSC_CONTEXT.vles} village level entrepreneurs, reaching{" "}
            {CSC_CONTEXT.gramPanchayatCoverage}, so a tool that also serves that operator
            reaches citizens who would otherwise never open a web form themselves.
          </p>
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            Source: Common Services Centres Scheme, Ministry of Electronics and Information
            Technology.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="font-display font-semibold text-xl mb-3" style={{ color: "var(--ink)" }}>
            Where coverage stops
          </h2>
          <p className="leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {DIRECTORY_COVERAGE_STATEMENT} Where a case falls outside that coverage, the honest
            answer is to say so, not to guess an address and let the applicant lose their fee
            finding out the hard way.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
