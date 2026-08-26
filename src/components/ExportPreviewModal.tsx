"use client";

import { downloadDataUrl } from "@/lib/exportPng";
import { IconDownload } from "@/components/icons";

export function ExportPreviewModal({
  dataUrl,
  filename,
  onClose,
}: {
  dataUrl: string;
  filename: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,.75)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-t-[28px] p-5 pb-8 flex flex-col gap-4 max-h-[88vh]"
        style={{ background: "var(--bg)", border: "1px solid var(--hairline)", borderBottom: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto shrink-0" style={{ background: "var(--hairline)" }} />

        <div className="font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wide text-center shrink-0">
          Imagem gerada
        </div>
        <div className="text-center text-[12px] shrink-0" style={{ color: "var(--muted)" }}>
          Toque e segure a imagem para salvar, ou use o botão abaixo.
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl" style={{ background: "var(--bg2)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt={filename} className="w-full h-auto block" />
        </div>

        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-3.5 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide min-h-[44px]"
            style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--hairline)" }}
          >
            Fechar
          </button>
          <button
            onClick={() => downloadDataUrl(dataUrl, filename)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide min-h-[44px]"
            style={{ background: "var(--gold)", color: "#141414" }}
          >
            <IconDownload size={16} />
            Baixar
          </button>
        </div>
      </div>
    </div>
  );
}
