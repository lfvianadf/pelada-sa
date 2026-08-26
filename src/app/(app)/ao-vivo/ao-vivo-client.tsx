"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { teamColor, fmtClock, type GameRow, type PlayerRow, type TeamRow, type MatchEventRow } from "@/lib/domain";
import { recordEvent, checkGameOutcome, endLive, resetLiveGame } from "@/lib/actions";

type Step = "closed" | "team" | "scorer" | "assist" | "borrowed-scorer" | "borrowed-assist";

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
  setStep,
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
}: {
  step: Step;
  setStep: (step: Step) => void;
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
              <button
                onClick={() => setStep("borrowed-scorer")}
                className="rounded-xl py-3.5 mt-1 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide min-h-[44px]"
                style={{ background: "transparent", color: "var(--gold)", border: "1px dashed var(--bgold)" }}
              >
                Jogador emprestado
              </button>
            </div>
          </>
        )}

        {step === "borrowed-scorer" && (
          <>
            <div className="font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide text-center">
              Qual jogador emprestado marcou?
            </div>
            <div className="flex flex-col gap-2">
              {players
                .filter((p) => !teamAPlayerIds.includes(p.id) && !teamBPlayerIds.includes(p.id))
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPickScorer(p.id)}
                    className="rounded-xl py-3.5 px-4 text-left font-bold text-[15px] min-h-[44px]"
                    style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}
                  >
                    {p.name}
                  </button>
                ))}
              {players.filter((p) => !teamAPlayerIds.includes(p.id) && !teamBPlayerIds.includes(p.id)).length === 0 && (
                <div className="text-center text-[13px] py-4" style={{ color: "var(--muted2)" }}>
                  Nenhum outro jogador presente na pelada.
                </div>
              )}
              <button
                onClick={() => setStep("scorer")}
                className="rounded-xl py-3.5 mt-1 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide min-h-[44px]"
                style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--hairline)" }}
              >
                ‹ Voltar
              </button>
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
                      className="rounded-xl py-3.5 px-4 text-left font-bold text-[15px] min-h-[44px]"
                      style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}
                    >
                      {p.name}
                    </button>
                  );
                })}
              <button
                onClick={() => setStep("borrowed-assist")}
                className="rounded-xl py-3.5 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide min-h-[44px]"
                style={{ background: "transparent", color: "var(--gold)", border: "1px dashed var(--bgold)" }}
              >
                Jogador emprestado
              </button>
              <button
                onClick={onSkipAssist}
                className="rounded-xl py-3.5 mt-1 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide min-h-[44px]"
                style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--hairline)" }}
              >
                Sem assistência
              </button>
            </div>
          </>
        )}

        {step === "borrowed-assist" && scorer && (
          <>
            <div className="font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide text-center">
              Qual jogador emprestado deu assistência?
            </div>
            <div className="text-center text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
              Gol de {scorer.name}
            </div>
            <div className="flex flex-col gap-2">
              {players
                .filter((p) => !teamAPlayerIds.includes(p.id) && !teamBPlayerIds.includes(p.id) && p.id !== scorer.id)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPickAssist(p.id)}
                    className="rounded-xl py-3.5 px-4 text-left font-bold text-[15px] min-h-[44px]"
                    style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}
                  >
                    {p.name}
                  </button>
                ))}
              <button
                onClick={() => setStep("assist")}
                className="rounded-xl py-3.5 mt-1 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide min-h-[44px]"
                style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--hairline)" }}
              >
                ‹ Voltar
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
  const [awaitingTieChoice, setAwaitingTieChoice] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [localEvents, setLocalEvents] = useState<MatchEventRow[]>(events);
  const [syncedEvents, setSyncedEvents] = useState(events);
  const pendingWritesRef = useRef<Promise<unknown>[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  if (events !== syncedEvents) {
    setSyncedEvents(events);
    setLocalEvents(events);
  }

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

  const scoreA = localEvents.filter((e) => e.type === "gol" && teamAPlayerIds.includes(e.player_id)).length;
  const scoreB = localEvents.filter((e) => e.type === "gol" && teamBPlayerIds.includes(e.player_id)).length;

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

  function trackWrite(promise: Promise<unknown>) {
    pendingWritesRef.current.push(promise);
    promise.finally(() => {
      pendingWritesRef.current = pendingWritesRef.current.filter((p) => p !== promise);
    });
  }

  function handlePickScorer(id: number) {
    setScorerId(id);
    setLocalEvents((prev) => [
      ...prev,
      { id: -Date.now(), game_id: game.id, player_id: id, type: "gol", sec: seconds, created_at: new Date().toISOString() },
    ]);
    setStep("assist");
    trackWrite(recordEvent(game.id, id, "gol", seconds));
  }

  function handlePickAssist(id: number) {
    setLocalEvents((prev) => [
      ...prev,
      { id: -Date.now(), game_id: game.id, player_id: id, type: "assistencia", sec: seconds, created_at: new Date().toISOString() },
    ]);
    resetFlow();
    trackWrite(recordEvent(game.id, id, "assistencia", seconds));
  }

  function handleSkipAssist() {
    resetFlow();
  }

  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  function handleEnd() {
    startTransition(async () => {
      if (pendingWritesRef.current.length > 0) {
        setIsSyncing(true);
        await Promise.allSettled(pendingWritesRef.current);
        setIsSyncing(false);
      }

      const outcome = await checkGameOutcome(game.id);
      if (outcome.error) return;

      if (outcome.tie) {
        setAwaitingTieChoice(true);
        return;
      }

      const result = await endLive(game.id);
      if (result.error) return;
      setIsNavigatingAway(true);
      router.push("/jogos");
    });
  }

  function handleResolveTie(stayingTeamId: number) {
    startTransition(async () => {
      const result = await endLive(game.id, stayingTeamId);
      if (result.error) return;
      setIsNavigatingAway(true);
      router.push("/jogos");
    });
  }

  function handleReset() {
    startTransition(async () => {
      await resetLiveGame(game.id);
      setConfirmingReset(false);
      router.refresh();
    });
  }

  const goalEvents = useMemo(() => [...localEvents].reverse(), [localEvents]);

  if (isNavigatingAway) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10">
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{ border: "3px solid var(--bg3)", borderTopColor: "var(--gold)" }}
        />
        <div className="font-[var(--font-head)] font-extrabold text-[15px] uppercase tracking-wide" style={{ color: "var(--gold)" }}>
          Encerrando jogo...
        </div>
      </div>
    );
  }

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
        <div className="px-5 pt-3.5 pb-5 flex gap-2.5" style={{ borderTop: "1px solid var(--hairline)" }}>
          <button
            onClick={() => setConfirmingReset(true)}
            disabled={isPending}
            className="rounded-xl px-4 py-3.5 font-[var(--font-head)] font-extrabold text-[14px] uppercase tracking-wide min-h-[44px] disabled:opacity-60"
            style={{ background: "transparent", color: "var(--muted)", border: "1.5px solid var(--hairline)" }}
          >
            Resetar
          </button>
          <button
            onClick={handleEnd}
            disabled={isPending}
            className="flex-1 rounded-xl py-3.5 font-[var(--font-head)] font-extrabold text-[14px] uppercase tracking-wide min-h-[44px] disabled:opacity-60"
            style={{ background: "transparent", color: "var(--red)", border: "1.5px solid var(--red)" }}
          >
            {isSyncing ? "Sincronizando..." : isPending ? "Encerrando..." : "Encerrar Jogo"}
          </button>
        </div>
      )}

      {confirmingReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,.6)" }}
          onClick={() => !isPending && setConfirmingReset(false)}
        >
          <div
            className="w-full max-w-[380px] rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide text-center">
              Resetar o jogo?
            </div>
            <div className="text-[13px] text-center" style={{ color: "var(--muted)" }}>
              O cronômetro, o placar e todos os gols/assistências registrados neste jogo serão apagados. Ele volta para
              &quot;agendado&quot;, aguardando um novo início. Essa ação não pode ser desfeita.
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmingReset(false)}
                disabled={isPending}
                className="flex-1 rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide disabled:opacity-60"
                style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--hairline)" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                disabled={isPending}
                className="flex-1 rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide disabled:opacity-60"
                style={{ background: "var(--red)", color: "#1a0a0a" }}
              >
                {isPending ? "Resetando..." : "Resetar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <GoalFlowSheet
        step={step}
        setStep={setStep}
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
      />

      {awaitingTieChoice && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,.6)" }}>
          <div
            className="w-full max-w-[480px] rounded-t-[28px] p-5 pb-8 flex flex-col gap-4"
            style={{ background: "var(--bg)", border: "1px solid var(--hairline)", borderBottom: "none" }}
          >
            <div className="w-10 h-1 rounded-full mx-auto" style={{ background: "var(--hairline)" }} />
            <div className="font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide text-center">
              Empate! Qual time fica?
            </div>
            <div className="text-center text-[13px]" style={{ color: "var(--muted)" }}>
              O time escolhido continua em quadra contra o próximo da fila.
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleResolveTie(teamA.id)}
                disabled={isPending}
                className="rounded-2xl py-4 font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wide min-h-[44px] disabled:opacity-60"
                style={{ background: "var(--bg2)", border: `1.5px solid ${teamColor(teamA.hue)}`, color: teamColor(teamA.hue) }}
              >
                {teamA.name}
              </button>
              <button
                onClick={() => handleResolveTie(teamB.id)}
                disabled={isPending}
                className="rounded-2xl py-4 font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wide min-h-[44px] disabled:opacity-60"
                style={{ background: "var(--bg2)", border: `1.5px solid ${teamColor(teamB.hue)}`, color: teamColor(teamB.hue) }}
              >
                {teamB.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
