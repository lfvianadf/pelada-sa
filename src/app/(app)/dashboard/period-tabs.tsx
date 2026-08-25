"use client";

import { useState } from "react";

const TABS: { key: "pelada" | "mes" | "ano"; label: string }[] = [
  { key: "pelada", label: "Pelada" },
  { key: "mes", label: "Mês" },
  { key: "ano", label: "Ano" },
];

export function PeriodTabs() {
  const [active, setActive] = useState<"pelada" | "mes" | "ano">("pelada");
  return (
    <div className="flex gap-1.5 rounded-xl p-1" style={{ background: "var(--bg2)" }}>
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => setActive(t.key)}
          className="flex-1 rounded-lg py-2.5 text-[11px] font-bold"
          style={{ background: active === t.key ? "var(--bg3)" : "transparent", color: active === t.key ? "var(--gold)" : "var(--muted)" }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
