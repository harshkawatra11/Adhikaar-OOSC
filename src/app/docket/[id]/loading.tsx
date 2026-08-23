export default function CaseLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 animate-pulse">
      <div className="flex items-start justify-between gap-4 pb-6 border-b-2" style={{ borderColor: "var(--ink)" }}>
        <div>
          <div className="h-3 w-24 mb-3" style={{ background: "var(--paper-deep)" }} />
          <div className="h-9 w-56 mb-2" style={{ background: "var(--paper-deep)" }} />
          <div className="h-4 w-80" style={{ background: "var(--paper-raised)" }} />
        </div>
        <div className="h-7 w-24" style={{ background: "var(--paper-deep)" }} />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="h-5 w-56 mb-4 pb-2 border-b" style={{ borderColor: "var(--rule)", background: "var(--paper-deep)" }} />
          <div className="border p-5 h-24" style={{ borderColor: "var(--rule-strong)", background: "var(--paper-raised)" }} />
        </div>
      ))}
    </div>
  );
}
