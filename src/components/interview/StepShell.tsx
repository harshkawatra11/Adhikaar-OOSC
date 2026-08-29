import type { ReactNode } from "react";

export function StepShell({
  eyebrow,
  title,
  help,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  help: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--gilt)" }}>
          {eyebrow}
        </p>
        <h1 className="font-display font-bold text-3xl mb-2" style={{ color: "var(--ink)" }}>
          {title}
        </h1>
        <p className="leading-relaxed" style={{ color: "var(--ink-soft)" }}>{help}</p>
      </div>
      <div>{children}</div>
      <div className="flex items-center gap-4 pt-2">{footer}</div>
    </div>
  );
}
