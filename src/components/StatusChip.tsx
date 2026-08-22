import type { CaseStatus } from "@/lib/types";

const STATUS_LABEL: Record<CaseStatus, string> = {
  intake: "Intake",
  triaged: "Triaged",
  drafted: "Drafted",
  filed: "Filed",
  awaiting_response: "Awaiting response",
  deemed_refusal: "Deemed refusal",
  first_appeal_drafted: "First appeal drafted",
  first_appeal_filed: "First appeal filed",
  second_appeal_drafted: "Second appeal drafted",
  second_appeal_filed: "Second appeal filed",
  resolved: "Resolved",
  out_of_coverage: "Out of coverage",
};

const STATUS_TONE: Record<CaseStatus, { bg: string; fg: string; border: string }> = {
  intake: { bg: "var(--paper-raised)", fg: "var(--ink-soft)", border: "var(--rule-strong)" },
  triaged: { bg: "var(--gilt-tint)", fg: "var(--gilt)", border: "var(--gilt)" },
  drafted: { bg: "var(--gilt-tint)", fg: "var(--gilt)", border: "var(--gilt)" },
  filed: { bg: "var(--forest-tint)", fg: "var(--forest)", border: "var(--forest)" },
  awaiting_response: { bg: "var(--forest-tint)", fg: "var(--forest)", border: "var(--forest)" },
  deemed_refusal: { bg: "var(--brick-tint)", fg: "var(--brick)", border: "var(--brick)" },
  first_appeal_drafted: { bg: "var(--brick-tint)", fg: "var(--brick)", border: "var(--brick)" },
  first_appeal_filed: { bg: "var(--brick-tint)", fg: "var(--brick)", border: "var(--brick)" },
  second_appeal_drafted: { bg: "var(--seal-tint)", fg: "var(--seal-deep)", border: "var(--seal)" },
  second_appeal_filed: { bg: "var(--seal-tint)", fg: "var(--seal-deep)", border: "var(--seal)" },
  resolved: { bg: "var(--forest-tint)", fg: "var(--forest)", border: "var(--forest)" },
  out_of_coverage: { bg: "var(--paper-deep)", fg: "var(--ink-faint)", border: "var(--rule)" },
};

export function StatusChip({ status }: { status: CaseStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className="inline-flex items-center border px-2.5 py-1 text-xs font-mono uppercase tracking-wide"
      style={{ background: tone.bg, color: tone.fg, borderColor: tone.border }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
