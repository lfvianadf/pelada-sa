export function Avatar({ size = 34, gold = false }: { size?: number; gold?: boolean }) {
  return (
    <div
      className="rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--bg3)",
        border: gold ? "2px solid var(--gold)" : undefined,
      }}
    />
  );
}
