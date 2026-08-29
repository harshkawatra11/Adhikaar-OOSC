import { DOLR_EVIDENCE } from "@/lib/data/evidence";
import { LINT_RULES } from "@/lib/linter/rules";
import { CitationTag } from "@/components/CitationTag";

export const metadata = { title: "Methodology | Adhikaar" };

const SCOPING_TABLE = [
  {
    direction: "RTI Drafting Agent",
    quote: "converts a plain-language question into a properly formatted application to the right department",
    status: "Exceeded",
    note: "The phrase “to the right department” is the entire thesis of this product. Jurisdiction triage, the legality linter and PDF generation together do more than format a request; they test whether the chosen authority can lawfully answer it before a document is produced.",
  },
  {
    direction: "Conversational Form-Filler",
    quote: "interviews the user and auto-populates the official form",
    status: "Covered, scoped to RTI",
    note: "Intake interviews the citizen and populates the RTI application. It was not generalised into a form-filler for arbitrary government forms, which would have diluted the depth of the RTI vertical without adding a defensible second one in the time available.",
  },
  {
    direction: "Rights Navigator",
    quote: "explains what a person can do about a specific tenant, consumer or workplace dispute",
    status: "Covered as remedy triage",
    note: "Full verticals for each dispute type were not built. Tenancy law in particular is entirely state-legislated with no uniform national statute, and is declared out of coverage rather than guessed at. What is built is routing: naming the correct forum, computing consumer pecuniary jurisdiction, and stopping rather than drafting an RTI that cannot deliver the relief sought.",
  },
  {
    direction: "Scheme Eligibility Reader",
    quote: "reads government portals and answers eligibility questions in plain language",
    status: "Deliberately not built",
    note: "Telling someone they qualify for a scheme does not move them any closer to receiving it. Documentation, official discretion and last-mile delivery are usually the binding constraint, not awareness of eligibility. Building a shallow eligibility reader would have added a feature without addressing the actual bottleneck, so it was left out rather than half-built.",
  },
];

function EvalRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="p-3" style={{ color: "var(--ink)" }}>{label}</td>
      <td className="p-3 font-mono text-right" style={{ color: "var(--seal-deep)" }}>{value}</td>
    </tr>
  );
}

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "var(--gilt)" }}>
        Methodology
      </p>
      <h1 className="font-display font-bold text-4xl mb-6" style={{ color: "var(--ink)" }}>
        What this system decides, what it merely proposes, and what it leaves alone
      </h1>
      <p className="text-lg leading-relaxed mb-12" style={{ color: "var(--ink-soft)" }}>
        A language model cannot be handed a legal verdict and trusted with it. It can draft, translate and
        summarise well, and it can propose a rewrite for a person to accept or reject. It should never be the thing
        that decides whether a question is lawful, when a deadline falls, or what a citizen owes in fees. This page
        states, plainly, where that line is drawn in this system, and where the scope of the underlying problem
        statement was interpreted rather than followed to the letter.
      </p>

      <section className="mb-14">
        <h2 className="font-display font-semibold text-2xl mb-4" style={{ color: "var(--ink)" }}>
          The boundary between code and model
        </h2>
        <div className="overflow-x-auto border" style={{ borderColor: "var(--rule-strong)" }}>
          <table className="ledger w-full text-sm">
            <thead>
              <tr style={{ background: "var(--paper-deep)" }}>
                <th className="text-left p-3 font-display" style={{ color: "var(--ink)" }}>
                  Concern
                </th>
                <th className="text-left p-3 font-display" style={{ color: "var(--ink)" }}>
                  Deterministic code
                </th>
                <th className="text-left p-3 font-display" style={{ color: "var(--ink)" }}>
                  Language model
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Union, State or Concurrent subject matter", "Decides, against a Seventh Schedule mapping", "Not consulted"],
                ["Is this question legally refusable", "Decides, against the eighteen-rule linter", "Never"],
                ["Statutory deadline arithmetic", "Decides, pure date functions", "Never"],
                ["Application fee for a given state", "Decides, a cited lookup table", "Never"],
                ["Whether a legal claim may render on screen", "Decides, the citation render gate", "Never"],
                ["Which authority within a jurisdiction to suggest", "Retrieval and filtering choose the candidates", "May re-rank, and must cite the candidate it picks"],
                ["Whether a question needs rewriting at all, and the safe mechanical rewrite itself", "Decides, the eighteen-rule linter, before any model is called", "Not consulted"],
                ["A more natural-sounding phrasing of that same rewrite", "Sets the boundary the rewrite must stay inside", "Optional, via Gemini; shown beside the mechanical version, never in place of it, and only applied if the citizen clicks accept"],
                ["Plain-language translation for the citizen", "Supplies the questions and grievance verbatim; the model may not add, drop, or reinterpret any of them", "Optional, via Gemini; always shown beside the formal English filing with a machine-translation notice"],
              ].map((row) => (
                <tr key={row[0]}>
                  <td className="p-3" style={{ color: "var(--ink)" }}>
                    {row[0]}
                  </td>
                  <td className="p-3" style={{ color: "var(--forest)" }}>
                    {row[1]}
                  </td>
                  <td className="p-3" style={{ color: "var(--ink-soft)" }}>
                    {row[2]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm mt-4" style={{ color: "var(--ink-faint)" }}>
          The rule stated plainly: a model may propose and phrase. It may never adjudicate or compute. Both
          Gemini-backed features are optional and additive. Adhikaar was built and fully tested, all ninety-four
          automated tests and the evaluation harness, before either was wired in, and both keep working exactly as
          before if no key is configured: the buttons simply report that translation is unavailable rather than
          failing silently or blocking anything else on the page.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="font-display font-semibold text-2xl mb-4" style={{ color: "var(--ink)" }}>
          How the problem statement was scoped
        </h2>
        <p className="mb-6 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          The brief for this challenge lists four illustrative directions and closes by welcoming an open
          reinterpretation. Building all four shallowly in the time available would have produced four wrapper
          features rather than one defensible system. Each direction is addressed below, including the one that was
          deliberately left out, rather than left unmentioned.
        </p>
        <div className="space-y-6">
          {SCOPING_TABLE.map((row) => (
            <div key={row.direction} className="border-l-4 pl-5" style={{ borderColor: "var(--gilt)" }}>
              <div className="flex flex-wrap items-baseline gap-3 mb-1">
                <h3 className="font-display font-semibold" style={{ color: "var(--ink)" }}>
                  {row.direction}
                </h3>
                <span
                  className="font-mono text-xs uppercase tracking-wide px-2 py-0.5 border"
                  style={{ borderColor: "var(--rule-strong)", color: "var(--seal-deep)" }}
                >
                  {row.status}
                </span>
              </div>
              <p className="text-sm italic mb-2" style={{ color: "var(--ink-faint)" }}>
                &ldquo;{row.quote}&rdquo;
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {row.note}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm leading-relaxed border p-4" style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)", color: "var(--ink-soft)" }}>
          One further interpretation is worth stating rather than leaving implicit. The challenge statement speaks
          of helping a citizen, and this system is built for exactly that citizen, signed in under their own
          account, from the first question through to the drafted document. It also works well through a second
          channel: the Common Service Centre operator, the legal aid volunteer or the RTI activist who files on a
          citizen&rsquo;s behalf. That second channel matters because the citizen most excluded by bureaucratic
          language is also the least likely to reach a web form on their own, but it is a second channel, not the
          primary one; the citizen typing at a keyboard is the person this system is built for first.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="font-display font-semibold text-2xl mb-4" style={{ color: "var(--ink)" }}>
          The evidence this product is built on
        </h2>
        <p className="leading-relaxed mb-3" style={{ color: "var(--ink-soft)" }}>
          {DOLR_EVIDENCE.returned.toLocaleString("en-IN")} of {DOLR_EVIDENCE.totalApplications.toLocaleString("en-IN")}{" "}
          applications recorded in the Department of Land Resources&rsquo; own section 4 disclosure register were
          returned to the applicant, not answered. The department states the reason in its own document:
        </p>
        <blockquote
          className="border-l-4 pl-5 italic my-4 text-sm leading-relaxed"
          style={{ borderColor: "var(--seal)", color: "var(--ink-soft)" }}
        >
          {DOLR_EVIDENCE.statedReason}
        </blockquote>
        <p className="leading-relaxed mb-2" style={{ color: "var(--ink-soft)" }}>
          {DOLR_EVIDENCE.caveat}
        </p>
        <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
          <a href={DOLR_EVIDENCE.sourceUrl} target="_blank" rel="noreferrer" className="underline">
            {DOLR_EVIDENCE.sourceLabel}
          </a>
        </p>
      </section>

      <section className="mb-14">
        <h2 className="font-display font-semibold text-2xl mb-4" style={{ color: "var(--ink)" }}>
          The linter, rule by rule
        </h2>
        <p className="leading-relaxed mb-6" style={{ color: "var(--ink-soft)" }}>
          Eighteen rules, each evaluated as plain code against the text of a drafted question, each one citing the
          section of the Act it is drawn from. Hover or open any citation to read the underlying text.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {LINT_RULES.map((rule) => (
            <div key={rule.id} className="border p-4 text-sm" style={{ borderColor: "var(--rule-strong)" }}>
              <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>
                {rule.title}
              </p>
              <CitationTag citationId={rule.citationId} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="font-display font-semibold text-2xl mb-4" style={{ color: "var(--ink)" }}>
          Measured, not asserted
        </h2>
        <p className="leading-relaxed mb-4" style={{ color: "var(--ink-soft)" }}>
          The gold set at <code className="font-mono text-sm">eval/dolr-gold-set.json</code> is a deterministic
          sample, every sixth record, of 220 real applications drawn from the same Department of Land Resources
          register cited above, each carrying its stated state and its actual recorded government disposal. Running
          <code className="font-mono text-sm"> npm run eval</code> asks a narrower question than the headline figure
          on the landing page: given only the application text, does the jurisdiction classifier recognise it as a
          State subject before anything is filed. The most recent run produced these numbers.
        </p>
        <div className="border overflow-x-auto" style={{ borderColor: "var(--rule-strong)" }}>
          <table className="ledger w-full text-sm">
            <tbody>
              <EvalRow label="Gold set size" value="220 records" />
              <EvalRow label="Returned to the applicant in the real register" value="203 / 220 (92.3%)" />
              <EvalRow label="Classified as a State subject from text alone" value="131 / 220 (59.5%)" />
              <EvalRow label='Specifically recognised as "Land and land revenue"' value="124 / 220 (56.4%)" />
              <EvalRow label="Not confidently classified, reported as such rather than guessed" value="73 / 220 (33.2%)" />
              <EvalRow label="Remedy classifier: correctly read as a records request" value="219 / 220 (99.5%)" />
            </tbody>
          </table>
        </div>
        <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--ink-faint)" }}>
          Read the 56.4 percent plainly: on real, messy, first-person citizen writing, the classifier recognises
          just over half of these land queries by keyword and pattern alone, and says it does not know about roughly
          a third rather than guessing. Both numbers are reported because a rule engine that only ever announces its
          successes is not trustworthy, and this one is asked to make legal-adjacent decisions.
        </p>
      </section>

      <section>
        <h2 className="font-display font-semibold text-2xl mb-4" style={{ color: "var(--ink)" }}>
          Coverage and what has not been built
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          <li>Two states are covered by name, Delhi and Maharashtra, alongside twelve central ministries and departments. No other state is covered, and the system says so rather than guessing an address.</li>
          <li>Tenancy disputes are recognised and routed to the correct forum by name, but no state rent authority is covered in depth, since tenancy law has no uniform national statute.</li>
          <li>Filing is never automated. Adhikaar prepares a document for a human to review and post; it does not submit anything to a government portal on anyone&rsquo;s behalf.</li>
          <li>The Maharashtra state RTI fee is flagged, not asserted, because the sources consulted while building this directory disagreed on the amount. The system shows both figures and the disagreement rather than picking one silently.</li>
          <li>Section 8(1)(j) is applied in its current form, in force since 13 November 2025 following its substitution by the Digital Personal Data Protection Act, 2023, and the linter notes that this provision is under constitutional challenge.</li>
        </ul>
      </section>
    </div>
  );
}
