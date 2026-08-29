import { RightsAsk } from "@/components/rights/RightsAsk";

export const metadata = {
  title: "Rights Navigator | Adhikaar",
  description:
    "Ask a question about your rights as a tenant, consumer, or worker, and get an answer grounded in the actual statutory text, cited section by section, or an honest 'we don't have a source for this' when the corpus doesn't cover it.",
};

export default function RightsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--gilt)" }}>
        Rights Navigator
      </p>
      <h1 className="font-display font-bold text-3xl mb-3" style={{ color: "var(--ink)" }}>
        Ask what the law actually says
      </h1>
      <p className="mb-8 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        Every answer here cites the specific article or section it comes from. When our corpus
        does not cover something with enough confidence, we say so rather than guess, the same
        way the RTI jurisdiction engine already refuses to name an authority it does not cover.
      </p>
      <RightsAsk />
    </div>
  );
}
