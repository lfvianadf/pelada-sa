"use client";

import { useRef, useState } from "react";
import { ScreenBody } from "@/components/Screen";
import { Avatar } from "@/components/Avatar";
import { IconDownload } from "@/components/icons";
import { ExportPreviewModal } from "@/components/ExportPreviewModal";
import type { PlayerRow, Standing } from "@/lib/domain";
import { captureElementAsPng } from "@/lib/exportPng";

interface Highlight {
  label: string;
  value: string;
  color: string;
}

type RankedPlayer<K extends string> = PlayerRow & Record<K, number>;

export function DashboardBody({
  scopeSelector,
  topScorer,
  topAssist,
  goalsRanking,
  assistsRanking,
  teamStandings,
  highlights,
}: {
  scopeSelector: React.ReactNode;
  topScorer: RankedPlayer<"goals"> | undefined;
  topAssist: RankedPlayer<"assists"> | undefined;
  goalsRanking: RankedPlayer<"goals">[];
  assistsRanking: RankedPlayer<"assists">[];
  teamStandings: Standing[];
  highlights: Highlight[];
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportDataUrl, setExportDataUrl] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  async function handleExport() {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await captureElementAsPng(exportRef.current);
      setExportDataUrl(dataUrl);
    } finally {
      setIsExporting(false);
    }
  }

  const content = (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-3.5 flex flex-col items-center gap-2"
          style={{ background: "linear-gradient(160deg,oklch(0.80 0.16 86 / .18),var(--bg2))", border: "1px solid var(--bgold)" }}
        >
          <Avatar size={52} gold />
          <div className="font-[var(--font-head)] font-extrabold text-[14px] text-center uppercase">{topScorer?.name ?? "—"}</div>
          <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Artilheiro</div>
          <div className="font-[var(--font-head)] font-extrabold text-[20px]" style={{ color: "var(--gold)" }}>{topScorer?.goals ?? 0} gols</div>
        </div>
        <div
          className="rounded-2xl p-3.5 flex flex-col items-center gap-2"
          style={{ background: "linear-gradient(160deg,oklch(0.72 0.17 148 / .18),var(--bg2))", border: "1px solid oklch(0.72 0.17 148 / .3)" }}
        >
          <Avatar size={52} />
          <div className="font-[var(--font-head)] font-extrabold text-[14px] text-center uppercase">{topAssist?.name ?? "—"}</div>
          <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Garçom da Rodada</div>
          <div className="font-[var(--font-head)] font-extrabold text-[20px]" style={{ color: "var(--green)" }}>{topAssist?.assists ?? 0} assist.</div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Ranking de Gols</div>
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}>
          {goalsRanking.map((r, i) => (
            <div key={r.id} className="flex items-center gap-2.5 px-3.5 py-2.5" style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
              <div className="font-[var(--font-head)] font-extrabold text-[12px] w-4" style={{ color: "var(--muted2)" }}>{i + 1}</div>
              <Avatar size={26} />
              <div className="flex-1 text-[13px] font-bold">{r.name}</div>
              <div className="font-[var(--font-head)] font-extrabold text-[15px]" style={{ color: "var(--gold)" }}>{r.goals}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Ranking de Assistências</div>
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}>
          {assistsRanking.map((r, i) => (
            <div key={r.id} className="flex items-center gap-2.5 px-3.5 py-2.5" style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
              <div className="font-[var(--font-head)] font-extrabold text-[12px] w-4" style={{ color: "var(--muted2)" }}>{i + 1}</div>
              <Avatar size={26} />
              <div className="flex-1 text-[13px] font-bold">{r.name}</div>
              <div className="font-[var(--font-head)] font-extrabold text-[15px]" style={{ color: "var(--green)" }}>{r.assists}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Desempenho por Time</div>
        <div className="rounded-xl overflow-x-auto" style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}>
          <div
            className="grid px-3 py-2.5 text-[9px] font-bold tracking-wide min-w-[380px]"
            style={{ gridTemplateColumns: "1.4fr .45fr .45fr .45fr .45fr .5fr .5fr .5fr", color: "var(--muted2)" }}
          >
            <div>TIME</div><div className="text-center">J</div><div className="text-center">V</div><div className="text-center">E</div>
            <div className="text-center">D</div><div className="text-center">GM</div><div className="text-center">GS</div><div className="text-center">SG</div>
          </div>
          {teamStandings.map((r) => (
            <div
              key={r.teamId}
              className="grid px-3 py-2.5 text-[11px] font-semibold items-center min-w-[380px]"
              style={{ gridTemplateColumns: "1.4fr .45fr .45fr .45fr .45fr .5fr .5fr .5fr", borderTop: "1px solid var(--hairline-soft)" }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                {r.name}
              </div>
              <div className="text-center">{r.j}</div>
              <div className="text-center" style={{ color: "var(--green)" }}>{r.v}</div>
              <div className="text-center">{r.e}</div>
              <div className="text-center" style={{ color: "var(--red)" }}>{r.d}</div>
              <div className="text-center">{r.gm}</div>
              <div className="text-center">{r.gs}</div>
              <div className="text-center" style={{ color: "var(--gold)" }}>{r.sg}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Destaques</div>
        <div className="grid grid-cols-2 gap-2.5">
          {highlights.map((h) => (
            <div key={h.label} className="rounded-xl p-3 flex flex-col gap-1" style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}>
              <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{h.label}</div>
              <div className="font-[var(--font-head)] font-extrabold text-[15px]" style={{ color: h.color }}>{h.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <ScreenBody>
      {scopeSelector}

      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center justify-center gap-2 rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[12px] uppercase tracking-wide min-h-[44px] disabled:opacity-60"
        style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
      >
        <IconDownload size={16} />
        {isExporting ? "Gerando imagem..." : "Exportar PNG"}
      </button>

      {content}

      <div style={{ position: "fixed", top: 0, left: "-9999px", pointerEvents: "none" }}>
        <div ref={exportRef} className="flex flex-col gap-5 p-6" style={{ background: "var(--bg)", width: 480 }}>
          <div className="text-center font-[var(--font-head)] font-extrabold text-[22px] uppercase tracking-wide">
            Raio-X da Pelada <span style={{ color: "var(--gold)" }}>· Santo Afonso</span>
          </div>
          {content}
        </div>
      </div>

      {exportDataUrl && (
        <ExportPreviewModal dataUrl={exportDataUrl} filename="raio-x-da-pelada.png" onClose={() => setExportDataUrl(null)} />
      )}
    </ScreenBody>
  );
}
