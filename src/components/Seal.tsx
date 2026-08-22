export function Seal({ size = 40 }: { size?: number }) {
  return (
    <div
      className="seal-mark flex items-center justify-center border-2"
      style={{
        width: size,
        height: size,
        borderColor: "var(--ink)",
        background: "var(--seal)",
        color: "var(--gilt-tint)",
        flexShrink: 0,
      }}
      aria-hidden
    >
      <span className="font-display font-bold" style={{ fontSize: size * 0.42, lineHeight: 1 }}>
        अ
      </span>
    </div>
  );
}
