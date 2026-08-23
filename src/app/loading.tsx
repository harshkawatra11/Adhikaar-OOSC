export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 animate-pulse">
      <div className="h-3 w-40 mb-4" style={{ background: "var(--paper-deep)" }} />
      <div className="h-12 w-3/4 mb-6" style={{ background: "var(--paper-deep)" }} />
      <div className="h-4 w-full mb-2" style={{ background: "var(--paper-raised)" }} />
      <div className="h-4 w-5/6" style={{ background: "var(--paper-raised)" }} />
    </div>
  );
}
