"use client";

import { useRouter } from "next/navigation";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function ScopeSelector({
  peladas,
  years,
  selectedScope,
}: {
  peladas: { id: number; date: string }[];
  years: string[];
  selectedScope: string;
}) {
  const router = useRouter();

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
        Período
      </span>
      <select
        value={selectedScope}
        onChange={(e) => router.push(`/dashboard?scope=${e.target.value}`)}
        className="rounded-[10px] px-3.5 py-3 text-[15px]"
        style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
      >
        <option value="all">Geral (todas as peladas)</option>
        {years.length > 0 && (
          <optgroup label="Temporadas">
            {years.map((y) => (
              <option key={y} value={`year-${y}`}>
                Temporada {y}
              </option>
            ))}
          </optgroup>
        )}
        {peladas.length > 0 && (
          <optgroup label="Peladas">
            {peladas.map((p) => (
              <option key={p.id} value={`pelada-${p.id}`}>
                {formatDate(p.date)}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </label>
  );
}
