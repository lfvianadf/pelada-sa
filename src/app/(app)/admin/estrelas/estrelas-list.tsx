"use client";

import { useState, useTransition } from "react";
import { ScreenBody } from "@/components/Screen";
import { Avatar } from "@/components/Avatar";
import { Stars } from "@/components/Stars";
import { aiSuggestedStars, type PlayerRow } from "@/lib/domain";
import type { Tables } from "@/lib/database.types";
import { approveStarSuggestion, ignoreStarSuggestion, adjustStars } from "@/lib/actions";

type StarSuggestionRow = Tables<"star_suggestions">;

export function EstrelasList({ players, suggestions }: { players: PlayerRow[]; suggestions: StarSuggestionRow[] }) {
  const [adjustingId, setAdjustingId] = useState<number | null>(null);
  const [adjustValue, setAdjustValue] = useState(3);
  const [decided, setDecided] = useState<Record<number, "approved" | "ignored">>({});
  const [isPending, startTransition] = useTransition();

  function latestSuggestionFor(playerId: number) {
    return suggestions.find((s) => s.player_id === playerId) ?? null;
  }

  const rows = players.map((p) => {
    const suggestion = latestSuggestionFor(p.id);
    const suggested = aiSuggestedStars(p);
    const decision = decided[p.id] ?? (suggestion?.status === "aprovada" ? "approved" : suggestion?.status === "ignorada" || suggestion?.status === "ajustada" ? "ignored" : undefined);
    const adjusting = adjustingId === p.id;
    const hasPending = suggested !== p.stars && decision !== "approved" && decision !== "ignored" && !adjusting;
    return { player: p, suggested, hasPending, adjusting, suggestionId: suggestion?.id ?? null };
  });
  const pendingCount = rows.filter((r) => r.hasPending).length;

  function handleApprove(playerId: number, suggestionId: number | null) {
    setDecided((prev) => ({ ...prev, [playerId]: "approved" }));
    startTransition(async () => {
      await approveStarSuggestion(playerId, suggestionId);
    });
  }

  function handleIgnore(playerId: number, suggestionId: number | null) {
    setDecided((prev) => ({ ...prev, [playerId]: "ignored" }));
    startTransition(async () => {
      await ignoreStarSuggestion(playerId, suggestionId);
    });
  }

  function handleStartAdjust(playerId: number, currentStars: number) {
    setAdjustingId(playerId);
    setAdjustValue(currentStars);
  }

  function handleConfirmAdjust(playerId: number, suggestionId: number | null) {
    setDecided((prev) => ({ ...prev, [playerId]: "approved" }));
    setAdjustingId(null);
    startTransition(async () => {
      await adjustStars(playerId, suggestionId, adjustValue);
    });
  }

  return (
    <>
      <div className="px-5 pt-5 pb-3" style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
        <div className="font-[var(--font-head)] font-extrabold text-[20px] uppercase tracking-wide">Gestão de Estrelas</div>
        <div className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--muted)" }}>{pendingCount} sugestões da IA pendentes</div>
      </div>
      <ScreenBody className="pt-3.5 gap-2.5">
        {rows.map(({ player: p, suggested, hasPending, adjusting, suggestionId }) => (
          <div
            key={p.id}
            className="rounded-2xl p-3.5 flex flex-col gap-2.5"
            style={{ background: "var(--bg2)", border: `1px solid ${hasPending ? "var(--bgold)" : "var(--hairline)"}` }}
          >
            <div className="flex items-center gap-2.5">
              <Avatar size={34} />
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="text-[14px] font-bold">{p.name}</div>
                <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: p.star_origin === "ia" ? "var(--gold)" : "var(--muted)" }}>
                  {p.star_origin === "ia" ? "Sugerido por IA" : "Manual"}
                </div>
              </div>
              <Stars value={p.stars} />
            </div>

            {hasPending && (
              <div className="flex flex-col gap-2.5 rounded-[10px] px-3 py-2.5" style={{ background: "oklch(0.80 0.16 86 / .08)" }}>
                <div className="flex items-center justify-center gap-2.5 text-[13px] font-bold">
                  <span style={{ color: "var(--muted)" }}>{p.stars}★</span>
                  <span style={{ color: "var(--muted2)" }}>→</span>
                  <span className="font-[var(--font-head)] font-extrabold text-[15px]" style={{ color: "var(--gold)" }}>{suggested}★ sugerido</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleApprove(p.id, suggestionId)}
                    disabled={isPending}
                    className="flex-1 rounded-lg py-2.5 font-[var(--font-head)] font-extrabold text-[11px] uppercase tracking-wide"
                    style={{ background: "var(--gold)", color: "#141414" }}
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleStartAdjust(p.id, p.stars)}
                    disabled={isPending}
                    className="flex-1 rounded-lg py-2.5 font-[var(--font-head)] font-extrabold text-[11px] uppercase tracking-wide"
                    style={{ background: "var(--bg3)", color: "var(--text)", border: "1px solid var(--hairline)" }}
                  >
                    Ajustar
                  </button>
                  <button
                    onClick={() => handleIgnore(p.id, suggestionId)}
                    disabled={isPending}
                    className="flex-1 rounded-lg py-2.5 font-[var(--font-head)] font-extrabold text-[11px] uppercase tracking-wide"
                    style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--hairline)" }}
                  >
                    Ignorar
                  </button>
                </div>
              </div>
            )}

            {adjusting && (
              <div className="flex items-center gap-3 justify-center rounded-[10px] p-2.5" style={{ background: "var(--bg3)" }}>
                <button onClick={() => setAdjustValue((v) => Math.max(1, v - 1))} className="w-[34px] h-[34px] rounded-lg text-[16px]" style={{ background: "var(--bg2)" }}>−</button>
                <div className="font-[var(--font-head)] font-extrabold text-[18px] w-6 text-center" style={{ color: "var(--gold)" }}>{adjustValue}</div>
                <button onClick={() => setAdjustValue((v) => Math.min(5, v + 1))} className="w-[34px] h-[34px] rounded-lg text-[16px]" style={{ background: "var(--bg2)" }}>+</button>
                <button
                  onClick={() => handleConfirmAdjust(p.id, suggestionId)}
                  disabled={isPending}
                  className="rounded-lg px-3.5 py-2 font-[var(--font-head)] font-extrabold text-[11px] uppercase"
                  style={{ background: "var(--gold)", color: "#141414" }}
                >
                  OK
                </button>
              </div>
            )}
          </div>
        ))}
      </ScreenBody>
    </>
  );
}
