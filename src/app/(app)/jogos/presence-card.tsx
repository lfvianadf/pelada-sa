"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmMyPresence, cancelMyPresence } from "@/lib/actions";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function PresenceCard({
  peladaId,
  date,
  alreadyConfirmed,
  confirmedCount,
}: {
  peladaId: number;
  date: string;
  alreadyConfirmed: boolean;
  confirmedCount: number;
}) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(alreadyConfirmed);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    setError(null);
    const next = !confirmed;
    setConfirmed(next);
    startTransition(async () => {
      const result = next ? await confirmMyPresence(peladaId) : await cancelMyPresence(peladaId);
      if (result.error) {
        setConfirmed(!next);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "var(--bg2)", border: "1px solid var(--bgold)" }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Próxima pelada
          </div>
          <div className="font-[var(--font-head)] font-extrabold text-[15px]">{formatDate(date)}</div>
        </div>
        <div className="text-[12px] font-semibold" style={{ color: "var(--muted2)" }}>
          {confirmedCount} confirmado{confirmedCount === 1 ? "" : "s"}
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={isPending}
        className="rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide min-h-[44px] disabled:opacity-60"
        style={{
          background: confirmed ? "oklch(0.72 0.17 148 / .12)" : "var(--gold)",
          color: confirmed ? "var(--green)" : "#141414",
          border: confirmed ? "1px solid oklch(0.72 0.17 148 / .3)" : "1px solid var(--gold)",
        }}
      >
        {confirmed ? "Presença confirmada ✓" : "Confirmar presença"}
      </button>

      {error && (
        <div className="text-[12px] font-semibold text-center" style={{ color: "var(--red)" }}>
          {error}
        </div>
      )}
    </div>
  );
}
