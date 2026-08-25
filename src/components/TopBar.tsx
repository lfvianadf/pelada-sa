export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-5 pt-5 pb-3 border-b" style={{ borderColor: "var(--hairline-soft)" }}>
      <div className="font-[var(--font-head)] font-extrabold text-[20px] uppercase tracking-wide">{title}</div>
      {subtitle && <div className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--muted)" }}>{subtitle}</div>}
    </div>
  );
}
