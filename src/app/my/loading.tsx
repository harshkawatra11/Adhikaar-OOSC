export default function MyFilingsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 animate-pulse">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="h-3 w-16 mb-3" style={{ background: "var(--paper-deep)" }} />
          <div className="h-8 w-64" style={{ background: "var(--paper-deep)" }} />
        </div>
        <div className="h-10 w-28" style={{ background: "var(--paper-deep)" }} />
      </div>
      <div className="border" style={{ borderColor: "var(--rule-strong)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 border-b flex items-center px-3 gap-6"
            style={{ borderColor: "var(--rule)", background: i % 2 ? "var(--paper-raised)" : "transparent" }}
          >
            <div className="h-3 w-32" style={{ background: "var(--paper-deep)" }} />
            <div className="h-3 w-48" style={{ background: "var(--paper-deep)" }} />
            <div className="h-3 w-24" style={{ background: "var(--paper-deep)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
