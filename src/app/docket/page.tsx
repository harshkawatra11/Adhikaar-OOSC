import Link from "next/link";
import { listCases } from "@/lib/store";
import { StatusChip } from "@/components/StatusChip";
import { daysUntil, isOverdue } from "@/lib/deadlines";

export const metadata = { title: "Docket | Adhikaar" };
export const dynamic = "force-dynamic";

// TODO(WP2): replaced by requireSession() once Firebase Auth lands.
const TEMP_OWNER_UID = "seed-owner";

export default async function DocketPage() {
  const cases = await listCases(TEMP_OWNER_UID);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--gilt)" }}>
            Docket
          </p>
          <h1 className="font-display font-bold text-3xl" style={{ color: "var(--ink)" }}>
            Open and closed cases
          </h1>
        </div>
        <Link
          href="/docket/new"
          className="border-2 px-5 py-2.5 font-body font-semibold"
          style={{ background: "var(--seal)", borderColor: "var(--ink)", color: "var(--paper)" }}
        >
          New case
        </Link>
      </div>

      {cases.length === 0 ? (
        <div className="border-2 border-dashed p-12 text-center" style={{ borderColor: "var(--rule)" }}>
          <p className="font-display text-xl mb-2" style={{ color: "var(--ink)" }}>
            No cases yet
          </p>
          <p className="mb-6" style={{ color: "var(--ink-soft)" }}>
            Open the first one to see jurisdiction triage, the legality linter and the statutory clock at work.
          </p>
          <Link href="/docket/new" className="underline font-medium" style={{ color: "var(--seal-deep)" }}>
            Open a new case
          </Link>
        </div>
      ) : (
        <div className="border overflow-x-auto" style={{ borderColor: "var(--rule-strong)" }}>
          <table className="ledger w-full text-sm">
            <thead>
              <tr style={{ background: "var(--paper-deep)" }}>
                <Th>Applicant</Th>
                <Th>Grievance</Th>
                <Th>Jurisdiction</Th>
                <Th>Status</Th>
                <Th>Next statutory action</Th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const nextDeadline = c.deadlines.find((d) => d.status === "pending");
                return (
                  <tr key={c.id}>
                    <td className="p-3 align-top">
                      <Link href={`/docket/${c.id}`} className="font-medium underline" style={{ color: "var(--ink)" }}>
                        {c.applicant.name || "Unnamed applicant"}
                      </Link>
                    </td>
                    <td className="p-3 align-top max-w-xs" style={{ color: "var(--ink-soft)" }}>
                      {c.grievanceSummary || "Not recorded"}
                    </td>
                    <td className="p-3 align-top font-mono text-xs" style={{ color: "var(--ink-soft)" }}>
                      {c.jurisdiction ? `${c.jurisdiction.scheduleList}: ${c.jurisdiction.subjectMatter}` : "Not yet triaged"}
                    </td>
                    <td className="p-3 align-top">
                      <StatusChip status={c.status} />
                    </td>
                    <td className="p-3 align-top text-sm">
                      {nextDeadline ? (
                        <span style={{ color: isOverdue(nextDeadline) ? "var(--brick)" : "var(--ink-soft)" }}>
                          {nextDeadline.label},{" "}
                          {isOverdue(nextDeadline)
                            ? `overdue by ${Math.abs(daysUntil(nextDeadline))} day(s)`
                            : `${daysUntil(nextDeadline)} day(s) left`}
                        </span>
                      ) : (
                        <span style={{ color: "var(--ink-faint)" }}>No pending deadline</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left p-3 font-display font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--ink)" }}>
      {children}
    </th>
  );
}
