"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { teamColor, fmtClock, type GameRow, type PlayerRow, type TeamRow, type MatchEventRow } from "@/lib/domain";
import { recordEvent, endLive } from "@/lib/actions";

type Step = "closed" | "team" | "scorer" | "assist";

function StopwatchDial({ seconds, durationSeconds }: { seconds: number; durationSeconds: number }) {
  const size = 220;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const remaining = durationSeconds - seconds;
  const timeUp = remaining <= 0;
  const displaySeconds = Math.abs(remaining);
  const progress = timeUp ? 1 : Math.max(0, remaining / durationSeconds);
  const mm = String(Math.floor(displaySeconds / 60)).padStart(2, "0");
  const ss = String(displaySeconds % 60).padStart(2, "0");
  const ringColor = timeUp ? "var(--red)" : "var(--gold)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className={timeUp ? "esa-pulse" : undefined}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <div
          className="font-[var(--font-head)] font-extrabold text-[46px] leading-none tabular-nums"
          style={{ color: timeUp ? "var(--red)" : "var(--text)" }}
        >
          {timeUp && "+"}
          {mm}:{ss}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full esa-pulse" style={{ background: "var(--red)" }} />
          <span className="font-[var(--font-head)] font-extrabold text-[10px] tracking-[2px]" style={{ color: "var(--red)" }}>
            {timeUp ? "TEMPO ESGOTADO" : "AO VIVO"}
          </span>
        </div>
      </div>
    </div>
  );
}

function GoalFlowSheet({
  step,
  teamA,
  teamB,
  teamAPlayerIds,
  teamBPlayerIds,
  players,
  onPickTeam,
  onPickScorer,
  onPickAssist,
  onSkipAssist,
  onClose,
  scorer,
  isPending,
}: {
  step: Step;
  teamA: TeamRow;
  teamB: TeamRow;
  teamAPlayerIds: number[];
  teamBPlayerIds: number[];
  players: PlayerRow[];
  onPickTeam: (side: "A" | "B") => void;
  onPickScorer: (playerId: number) => void;
  onPickAssist: (playerId: number) => void;
  onSkipAssist: () => void;
  onClose: () => void;
  scorer: PlayerRow | null;
  isPending: boolean;
}) {
  if (step === "closed") return null;

  function player(id: number) {
    return players.find((p) => p.id === id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,.6)" }} onClick={onClose}>
      <div
        className="w-full max-w-[480px] rounded-t-[28px] p-5 pb-8 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
        style={{ background: "var(--bg)", border: "1px solid var(--hairline)", borderBottom: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto" style={{ background: "var(--hairline)" }} />

        {step === "team" && (
          <>
            <div className="font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide text-center">Qual time marcou?</div>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => onPickTeam("A")}
                className="rounded-2xl py-5 font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide min-h-[44px]"
                style={{ background: "var(--bg2)", border: `1.5px solid ${teamColor(teamA.hue)}`, color: teamColor(teamA.hue) }}
              >
                {teamA.name}
              </button>
              <button
                onClick={() => onPickTeam("B")}
                className="rounded-2xl py-5 font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide min-h-[44px]"
                style={{ background: "var(--bg2)", border: `1.5px solid ${teamColor(teamB.hue)}`, color: teamColor(teamB.hue) }}
              >
                {teamB.name}
              </button>
            </div>
          </>
        )}

        {step === "scorer" && (
          <>
            <div className="font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide text-center">Quem marcou?</div>
            <div className="flex flex-col gap-2">
              {(teamAPlayerIds.length ? teamAPlayerIds : teamBPlayerIds).map((id) => {
                const p = player(id);
                if (!p) return null;
                return (
                  <button
                    key={id}
                    onClick={() => onPickScorer(id)}
                    className="rounded-xl py-3.5 px-4 text-left font-bold text-[15px] min-h-[44px]"
                    style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === "assist" && scorer && (
          <>
            <div className="font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide text-center">Teve assistência?</div>
            <div className="text-center text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
              Gol de {scorer.name}
            </div>
            <div className="flex flex-col gap-2">
              {(teamAPlayerIds.length ? teamAPlayerIds : teamBPlayerIds)
                .filter((id) => id !== scorer.id)
                .map((id) => {
                  const p = player(id);
                  if (!p) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => onPickAssist(id)}
                      disabled={isPending}
                      className="rounded-xl py-3.5 px-4 text-left font-bold text-[15px] min-h-[44px] disabled:opacity-60"
                      style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}
                    >
                      {p.name}
                    </button>
                  );
                })}
              <button
                onClick={onSkipAssist}
                disabled={isPending}
                className="rounded-xl py-3.5 mt-1 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide min-h-[44px] disabled:opacity-60"
                style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--hairline)" }}
              >
                {isPending ? "Salvando..." : "Sem assistência"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function AoVivoClient({
  game,
  teamA,
  teamB,
  teamAPlayerIds,
  teamBPlayerIds,
  players,
  events,
  isAdmin,
  durationMinutes,
}: {
  game: GameRow;
  teamA: TeamRow;
  teamB: TeamRow;
  teamAPlayerIds: number[];
  teamBPlayerIds: number[];
  players: PlayerRow[];
  events: MatchEventRow[];
  isAdmin: boolean;
  durationMinutes: number;
}) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const durationSeconds = durationMinutes * 60;
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<Step>("closed");
  const [side, setSide] = useState<"A" | "B" | null>(null);
  const [scorerId, setScorerId] = useState<number | null>(null);

  useEffect(() => {
    if (!game.started_at) return;
    const startedAt = new Date(game.started_at).getTime();
    function tick() {
      setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [game.started_at]);

  function playerName(id: number) {
    return players.find((p) => p.id === id)?.name ?? "";
  }
  function player(id: number) {
    return players.find((p) => p.id === id);
  }

  const scoreA = events.filter((e) => e.type === "gol" && teamAPlayerIds.includes(e.player_id)).length;
  const scoreB = events.filter((e) => e.type === "gol" && teamBPlayerIds.includes(e.player_id)).length;

  const scorer = scorerId ? player(scorerId) ?? null : null;
  const sidePlayerIds = side === "A" ? teamAPlayerIds : side === "B" ? teamBPlayerIds : [];

  function resetFlow() {
    setStep("closed");
    setSide(null);
    setScorerId(null);
  }

  function handlePickTeam(pickedSide: "A" | "B") {
    setSide(pickedSide);
    setStep("scorer");
  }

  function handlePickScorer(id: number) {
    setScorerId(id);
    startTransition(async () => {
      await recordEvent(game.id, id, "gol", seconds);
      router.refresh();
      setStep("assist");
    });
  }

  function handlePickAssist(id: number) {
    startTransition(async () => {
      await recordEvent(game.id, id, "assistencia", seconds);
      router.refresh();
      resetFlow();
    });
  }

  function handleSkipAssist() {
    resetFlow();
  }

  function handleEnd() {
    startTransition(async () => {
      await endLive(game.id);
      router.push("/jogos");
    });
  }

  const goalEvents = useMemo(() => [...events].reverse(), [events]);

  return (
    <>
      <div className="flex-1 flex flex-col items-center gap-6 px-5 pt-6 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 text-center font-[var(--font-head)] font-extrabold text-[15px] uppercase" style={{ color: teamColor(teamA.hue) }}>
            {teamA.name}
          </div>
          <div className="flex items-center gap-2.5 font-[var(--font-head)] font-extrabold text-[38px] leading-none px-3">
            <span>{scoreA}</span>
            <span style={{ color: "var(--muted2)", fontSize: 22 }}>×</span>
            <span>{scoreB}</span>
          </div>
          <div className="flex-1 text-center font-[var(--font-head)] font-extrabold text-[15px] uppercase" style={{ color: teamColor(teamB.hue) }}>
            {teamB.name}
          </div>
        </div>

        <StopwatchDial seconds={seconds} durationSeconds={durationSeconds} />

        {isAdmin && (
          <button
            onClick={() => setStep("team")}
            className="w-full max-w-[280px] rounded-full py-5 font-[var(--font-head)] font-extrabold text-[20px] uppercase tracking-wider min-h-[44px]"
            style={{ background: "var(--gold)", color: "#141414", boxShadow: "0 10px 30px oklch(0.80 0.16 86 / .3)" }}
          >
            Gol
          </button>
        )}

        <div className="w-full flex flex-col gap-2">
          <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Eventos da partida
          </div>
          {goalEvents.map((ev) => (
            <div key={ev.id} className="flex items-center gap-2.5 text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center font-[var(--font-head)] font-extrabold text-[10px] shrink-0"
                style={{
                  background: ev.type === "gol" ? "oklch(0.80 0.16 86 / .2)" : "oklch(0.72 0.17 148 / .2)",
                  color: ev.type === "gol" ? "var(--gold)" : "var(--green)",
                }}
              >
                {ev.type === "gol" ? "G" : "A"}
              </div>
              <span style={{ color: "var(--text)" }}>{playerName(ev.player_id)}</span>
              <span>{ev.type === "gol" ? "marcou um gol" : "deu assistência"}</span>
              <span style={{ color: "var(--muted2)" }}>{fmtClock(ev.sec)}</span>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="px-5 pt-3.5 pb-5" style={{ borderTop: "1px solid var(--hairline)" }}>
          <button
            onClick={handleEnd}
            disabled={isPending}
            className="w-full rounded-xl py-3.5 font-[var(--font-head)] font-extrabold text-[14px] uppercase tracking-wide min-h-[44px] disabled:opacity-60"
            style={{ background: "transparent", color: "var(--red)", border: "1.5px solid var(--red)" }}
          >
            {isPending ? "Encerrando..." : "Encerrar Jogo"}
          </button>
        </div>
      )}

      <GoalFlowSheet
        step={step}
        teamA={teamA}
        teamB={teamB}
        teamAPlayerIds={sidePlayerIds.length ? sidePlayerIds : teamAPlayerIds}
        teamBPlayerIds={teamBPlayerIds}
        players={players}
        onPickTeam={handlePickTeam}
        onPickScorer={handlePickScorer}
        onPickAssist={handlePickAssist}
        onSkipAssist={handleSkipAssist}
        onClose={resetFlow}
        scorer={scorer}
        isPending={isPending}
      />
    </>
  );
}
