"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { teamColor, type Standing, type GameRow, type TeamRow } from "@/lib/domain";
import { startLive } from "@/lib/actions";

export function JogosList({
  games,
  teams,
  standings,
  isAdmin,
}: {
  games: GameRow[];
  teams: TeamRow[];
  standings: Standing[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function team(id: number) {
    return teams.find((t) => t.id === id);
  }

  function handleTap(gameId: number, status: string) {
    if (status !== "agendado" || !isAdmin) return;
    startTransition(async () => {
      await startLive(gameId);
      router.push("/ao-vivo");
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {games.map((g) => {
          const a = team(g.team_a_id);
          const b = team(g.team_b_id);
          if (!a || !b) return null;
          const finalizado = g.status === "finalizado";
          const statusStyle = finalizado
            ? { label: "FINALIZADO", color: "var(--green)", bg: "oklch(0.72 0.17 148 / .12)", border: "oklch(0.72 0.17 148 / .25)" }
            : { label: g.status === "ao vivo" ? "AO VIVO" : "AGENDADO", color: "var(--muted)", bg: "oklch(1 0 0 / .08)", border: "oklch(1 0 0 / .08)" };
          return (
            <button
              key={g.id}
              onClick={() => handleTap(g.id, g.status)}
              disabled={isPending}
              className="rounded-2xl px-4 py-3.5 flex flex-col gap-2.5 text-left cursor-pointer disabled:opacity-60"
              style={{ background: "var(--bg2)", border: `1px solid ${statusStyle.border}` }}
            >
              <div className="flex justify-center">
                <span
                  className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full"
                  style={{ color: statusStyle.color, background: statusStyle.bg }}
                >
                  {statusStyle.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: teamColor(a.hue) }} />
                  <div className="text-[13px] font-bold text-center">{a.name}</div>
                </div>
                <div className="font-[var(--font-head)] font-extrabold text-[26px] px-2.5">
                  {g.status === "agendado" ? "vs" : `${g.score_a} × ${g.score_b}`}
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: teamColor(b.hue) }} />
                  <div className="text-[13px] font-bold text-center">{b.name}</div>
                </div>
              </div>
            </button>
          );
        })}
        {games.length === 0 && (
          <div className="text-center text-[13px] py-4" style={{ color: "var(--muted2)" }}>
            Nenhum jogo cadastrado ainda.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
          Classificação do dia
        </div>
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}>
          <div
            className="grid px-3 py-2.5 text-[10px] font-bold tracking-wide"
            style={{ gridTemplateColumns: "1.6fr .5fr .5fr .5fr .5fr .6fr", color: "var(--muted2)", borderBottom: "1px solid var(--hairline-soft)" }}
          >
            <div>TIME</div>
            <div className="text-center">J</div>
            <div className="text-center">V</div>
            <div className="text-center">E</div>
            <div className="text-center">D</div>
            <div className="text-center">SG</div>
          </div>
          {standings.map((r) => (
            <div
              key={r.teamId}
              className="grid px-3 py-2.5 text-[12px] font-semibold items-center"
              style={{ gridTemplateColumns: "1.6fr .5fr .5fr .5fr .5fr .6fr", borderBottom: "1px solid var(--hairline-soft)" }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                {r.name}
              </div>
              <div className="text-center" style={{ color: "var(--muted)" }}>{r.j}</div>
              <div className="text-center" style={{ color: "var(--green)" }}>{r.v}</div>
              <div className="text-center" style={{ color: "var(--muted)" }}>{r.e}</div>
              <div className="text-center" style={{ color: "var(--red)" }}>{r.d}</div>
              <div className="text-center" style={{ color: "var(--gold)" }}>{r.sg}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
