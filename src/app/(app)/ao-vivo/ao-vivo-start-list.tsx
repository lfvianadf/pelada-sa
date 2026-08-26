"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startLive } from "@/lib/actions";
import { teamColor, type TeamRow } from "@/lib/domain";
import { IconPlay } from "@/components/icons";

export function AoVivoStartList({
  scheduled,
  teams,
}: {
  scheduled: { id: number; team_a_id: number; team_b_id: number }[];
  teams: TeamRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [startingGameId, setStartingGameId] = useState<number | null>(null);

  function team(id: number) {
    return teams.find((t) => t.id === id);
  }

  function handleStart(gameId: number) {
    setStartingGameId(gameId);
    startTransition(async () => {
      await startLive(gameId);
      router.refresh();
    });
  }

  if (startingGameId !== null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10">
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{ border: "3px solid var(--bg3)", borderTopColor: "var(--gold)" }}
        />
        <div className="font-[var(--font-head)] font-extrabold text-[15px] uppercase tracking-wide" style={{ color: "var(--gold)" }}>
          Iniciando partida...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {scheduled.map((g) => {
        const a = team(g.team_a_id);
        const b = team(g.team_b_id);
        if (!a || !b) return null;
        const colorA = teamColor(a.hue);
        const colorB = teamColor(b.hue);
        return (
          <button
            key={g.id}
            onClick={() => handleStart(g.id)}
            disabled={isPending}
            className="relative w-full rounded-3xl overflow-hidden disabled:opacity-60"
            style={{ border: "1px solid var(--hairline)", boxShadow: "0 12px 30px rgba(0,0,0,.5)" }}
          >
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(120deg, ${colorA} 0%, var(--bg2) 45%, var(--bg2) 55%, ${colorB} 100%)`, opacity: 0.22 }}
            />
            <div className="relative flex flex-col items-center gap-4 px-5 py-8" style={{ background: "oklch(0.1 0.006 260 / .35)" }}>
              <div className="flex items-center justify-center gap-4 w-full">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: colorA }} />
                  <div
                    className="font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wide text-center"
                    style={{ color: colorA }}
                  >
                    {a.name}
                  </div>
                </div>
                <div className="font-[var(--font-head)] font-extrabold text-[20px]" style={{ color: "var(--muted2)" }}>
                  VS
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: colorB }} />
                  <div
                    className="font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wide text-center"
                    style={{ color: colorB }}
                  >
                    {b.name}
                  </div>
                </div>
              </div>

              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 64,
                  height: 64,
                  background: "var(--gold)",
                  boxShadow: "0 8px 24px oklch(0.80 0.16 86 / .4)",
                }}
              >
                <IconPlay size={26} color="#141414" />
              </div>

              <div className="font-[var(--font-head)] font-extrabold text-[12px] uppercase tracking-[2px]" style={{ color: "var(--gold)" }}>
                Iniciar Partida
              </div>
            </div>
          </button>
        );
      })}
      {scheduled.length === 0 && (
        <div className="text-center text-[13px] py-4" style={{ color: "var(--muted2)" }}>
          Nenhum confronto agendado.
        </div>
      )}
    </div>
  );
}
