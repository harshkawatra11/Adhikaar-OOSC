export function Seal({ size = 40, tone = "light" }: { size?: number; tone?: "light" | "dark" }) {
  return (
    <div
      className="seal-mark flex items-center justify-center border-2"
      style={{
        width: size,
        height: size,
        borderColor: tone === "dark" ? "var(--foil)" : "var(--ink)",
        background: "var(--seal)",
        color: "var(--gilt-tint)",
        flexShrink: 0,
      }}
      aria-hidden
    >
      <span className="font-devanagari" style={{ fontSize: size * 0.42, lineHeight: 1 }}>
        अ
      </span>
    </div>
  );
}
