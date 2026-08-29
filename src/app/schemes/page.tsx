import { EligibilityWizard } from "@/components/schemes/EligibilityWizard";

export const metadata = {
  title: "Scheme Eligibility Reader | Adhikaar",
  description:
    "Answer a few questions and see exactly which of eight government schemes you qualify for, and which specific rule you fail where you don't, rather than a bare yes or no.",
};

export default function SchemesPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--gilt)" }}>
        Scheme Eligibility Reader
      </p>
      <h1 className="font-display font-bold text-3xl mb-3" style={{ color: "var(--ink)" }}>
        Do you actually qualify?
      </h1>
      <p className="mb-8 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        The government&rsquo;s own scheme portal, myscheme.gov.in, is real and useful. What
        this does differently: every answer here shows the exact rule applied, criterion by
        criterion, not a bare yes or no, and if you don&rsquo;t qualify you can ask the
        department why, in writing, in one click.
      </p>
      <EligibilityWizard />
    </div>
  );
}
