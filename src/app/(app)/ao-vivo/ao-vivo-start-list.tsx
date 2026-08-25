"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { startLive } from "@/lib/actions";

export function AoVivoStartList({
  scheduled,
  teams,
}: {
  scheduled: { id: number; team_a_id: number; team_b_id: number }[];
  teams: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function team(id: number) {
    return teams.find((t) => t.id === id);
  }

  function handleStart(gameId: number) {
    startTransition(async () => {
      await startLive(gameId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2.5">
      {scheduled.map((g) => {
        const a = team(g.team_a_id);
        const b = team(g.team_b_id);
        if (!a || !b) return null;
        return (
          <button
            key={g.id}
            onClick={() => handleStart(g.id)}
            disabled={isPending}
            className="rounded-xl px-4 py-3.5 flex items-center justify-between min-h-[44px] disabled:opacity-60"
            style={{ background: "var(--bg2)", border: "1px solid var(--bgold)" }}
          >
            <span className="text-[13px] font-bold">
              {a.name} <span style={{ color: "var(--muted2)" }}>vs</span> {b.name}
            </span>
            <span className="font-[var(--font-head)] font-extrabold text-[10px] uppercase tracking-wide" style={{ color: "var(--gold)" }}>
              Iniciar ▸
            </span>
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
