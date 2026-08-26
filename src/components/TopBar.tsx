export function TopBar({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="px-5 pt-5 pb-3 border-b flex items-start justify-between gap-3" style={{ borderColor: "var(--hairline-soft)" }}>
      <div>
        <div className="font-[var(--font-head)] font-extrabold text-[20px] uppercase tracking-wide">{title}</div>
        {subtitle && <div className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--muted)" }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}
