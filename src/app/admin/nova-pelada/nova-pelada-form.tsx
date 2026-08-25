"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ScreenBody, BottomCTA } from "@/components/Screen";
import { Stars } from "@/components/Stars";
import { Avatar } from "@/components/Avatar";
import { IconPlus } from "@/components/icons";
import type { Position } from "@/lib/types";
import type { PlayerRow } from "@/lib/domain";
import {
  createPelada,
  createGuestPlayer,
  setPresence,
  updatePeladaNumTeams,
  updatePeladaDuration,
  sortear,
} from "@/lib/actions";

const DURATION_PRESETS = [2, 7, 10];
const POSITIONS: Position[] = ["Qualquer", "Goleiro", "Zagueiro", "Meio-campo", "Atacante"];

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Pelada",
  2: "Jogadores",
  3: "Times",
};

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 px-5 pt-4">
      {([1, 2, 3] as Step[]).map((s, i) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-[var(--font-head)] font-extrabold text-[13px] shrink-0"
              style={{
                background: s <= step ? "var(--gold)" : "var(--bg2)",
                color: s <= step ? "#141414" : "var(--muted)",
                border: `1px solid ${s <= step ? "var(--gold)" : "var(--hairline)"}`,
              }}
            >
              {s}
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-wide hidden xs:inline"
              style={{ color: s === step ? "var(--text)" : "var(--muted)" }}
            >
              {STEP_LABELS[s]}
            </span>
          </div>
          {i < 2 && <div className="h-px flex-1" style={{ background: s < step ? "var(--gold)" : "var(--hairline)" }} />}
        </div>
      ))}
    </div>
  );
}

export function NovaPeladaForm({
  players: initialPlayers,
  initialPeladaId,
  initialDate,
  initialNumTeams,
  initialDurationMinutes,
  initialPresentIds,
}: {
  players: PlayerRow[];
  initialPeladaId: number | null;
  initialDate: string;
  initialNumTeams: number;
  initialDurationMinutes: number;
  initialPresentIds: number[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [peladaId, setPeladaId] = useState(initialPeladaId);
  const [date, setDate] = useState(initialDate);
  const [numTeams, setNumTeams] = useState(initialNumTeams);
  const [durationMinutes, setDurationMinutes] = useState(initialDurationMinutes);
  const [players, setPlayers] = useState<PlayerRow[]>(initialPlayers);
  const [presentIds, setPresentIds] = useState<number[]>(initialPresentIds);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [guestOpen, setGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPosition, setGuestPosition] = useState<Position>("Qualquer");

  async function ensurePeladaId(): Promise<number | null> {
    if (peladaId) return peladaId;
    const result = await createPelada(date, numTeams, durationMinutes);
    if (result.error || !result.peladaId) {
      setError(result.error ?? "Erro ao criar pelada.");
      return null;
    }
    setPeladaId(result.peladaId);
    return result.peladaId;
  }

  function handleCreatePelada() {
    setError(null);
    startTransition(async () => {
      const id = await ensurePeladaId();
      if (!id) return;
      setStep(2);
    });
  }

  function handleDurationChange(minutes: number) {
    if (minutes < 1 || minutes > 90) return;
    setDurationMinutes(minutes);
    if (peladaId) {
      startTransition(async () => {
        await updatePeladaDuration(peladaId, minutes);
      });
    }
  }

  function handleToggle(playerId: number) {
    if (!peladaId) return;
    const present = presentIds.includes(playerId);
    setPresentIds((prev) => (present ? prev.filter((id) => id !== playerId) : [...prev, playerId]));
    startTransition(async () => {
      await setPresence(peladaId, playerId, !present);
    });
  }

  function handleCreateGuest() {
    if (!peladaId || !guestName.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createGuestPlayer(peladaId, guestName, guestPosition);
      if (result.error || !result.playerId) {
        setError(result.error ?? "Erro ao cadastrar jogador.");
        return;
      }
      setPlayers((prev) => [
        ...prev,
        { id: result.playerId!, name: guestName.trim(), position: guestPosition, stars: 3 } as PlayerRow,
      ]);
      setPresentIds((prev) => [...prev, result.playerId!]);
      setGuestName("");
      setGuestPosition("Qualquer");
      setGuestOpen(false);
    });
  }

  function handleNumTeamsChange(n: number) {
    if (n < 2 || n > 5) return;
    setNumTeams(n);
    if (peladaId) {
      startTransition(async () => {
        await updatePeladaNumTeams(peladaId, n);
      });
    }
  }

  function handleSortear() {
    if (!peladaId) return;
    setError(null);
    startTransition(async () => {
      const result = await sortear(peladaId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/admin/sorteio?pelada=${peladaId}`);
    });
  }

  return (
    <>
      <StepIndicator step={step} />
      <ScreenBody className="pb-3">
        {step === 1 && (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                Data da pelada
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-[10px] px-3.5 py-3 text-[15px]"
                style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
              />
            </label>

            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                Duração do jogo
              </span>
              <div className="flex gap-2">
                {DURATION_PRESETS.map((min) => (
                  <button
                    key={min}
                    onClick={() => handleDurationChange(min)}
                    className="flex-1 rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[15px]"
                    style={{
                      background: durationMinutes === min ? "var(--gold)" : "var(--bg2)",
                      color: durationMinutes === min ? "#141414" : "var(--text)",
                      border: `1px solid ${durationMinutes === min ? "var(--gold)" : "var(--hairline)"}`,
                    }}
                  >
                    {min} min
                  </button>
                ))}
              </div>
              <div
                className="flex items-center justify-between gap-4 rounded-xl px-4 py-2.5"
                style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}
              >
                <button
                  onClick={() => handleDurationChange(Math.max(1, durationMinutes - 1))}
                  className="w-10 h-10 rounded-[10px] text-[20px]"
                  style={{ background: "var(--bg3)", color: "var(--text)" }}
                >
                  −
                </button>
                <div className="font-[var(--font-head)] font-extrabold text-[18px]">{durationMinutes} min</div>
                <button
                  onClick={() => handleDurationChange(Math.min(90, durationMinutes + 1))}
                  className="w-10 h-10 rounded-[10px] text-[20px]"
                  style={{ background: "var(--bg3)", color: "var(--text)" }}
                >
                  +
                </button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                Jogadores presentes
              </span>
              <span className="font-[var(--font-head)] font-extrabold text-[13px]" style={{ color: "var(--gold)" }}>
                {presentIds.length}/{players.length}
              </span>
            </div>

            {guestOpen ? (
              <div className="rounded-xl p-3.5 flex flex-col gap-3" style={{ background: "var(--bg2)", border: "1px solid var(--bgold)" }}>
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Nome do jogador"
                  className="rounded-[10px] px-3.5 py-2.5 text-[14px]"
                  style={{ background: "var(--bg3)", border: "1px solid var(--hairline)", color: "var(--text)" }}
                />
                <select
                  value={guestPosition}
                  onChange={(e) => setGuestPosition(e.target.value as Position)}
                  className="rounded-[10px] px-3.5 py-2.5 text-[14px]"
                  style={{ background: "var(--bg3)", border: "1px solid var(--hairline)", color: "var(--text)" }}
                >
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p === "Qualquer" ? "Qualquer posição" : p}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGuestOpen(false)}
                    className="flex-1 rounded-lg py-2.5 font-[var(--font-head)] font-extrabold text-[11px] uppercase tracking-wide"
                    style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--hairline)" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateGuest}
                    disabled={isPending || !guestName.trim()}
                    className="flex-1 rounded-lg py-2.5 font-[var(--font-head)] font-extrabold text-[11px] uppercase tracking-wide disabled:opacity-50"
                    style={{ background: "var(--gold)", color: "#141414" }}
                  >
                    {isPending ? "Salvando..." : "Adicionar"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setGuestOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[12px] uppercase tracking-wide min-h-[44px]"
                style={{ background: "var(--bg2)", border: "1px dashed var(--hairline)", color: "var(--gold)" }}
              >
                <IconPlus size={16} />
                Novo jogador
              </button>
            )}

            <div className="flex flex-col gap-2">
              {players.map((p) => {
                const present = presentIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => handleToggle(p.id)}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left min-h-[44px]"
                    style={{ background: "var(--bg2)", border: `1px solid ${present ? "var(--bgold)" : "var(--hairline-soft)"}` }}
                  >
                    <div
                      className="w-5 h-5 rounded-[6px] shrink-0"
                      style={{ border: `2px solid ${present ? "var(--gold)" : "oklch(1 0 0 / .2)"}`, background: present ? "var(--gold)" : "transparent" }}
                    />
                    <Avatar size={34} />
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="text-[14px] font-bold">{p.name}</div>
                      <div className="text-[10px] font-semibold" style={{ color: "var(--muted)" }}>{p.position}</div>
                    </div>
                    <Stars value={p.stars} size={13} />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              Quantidade de times
            </span>
            <div
              className="flex items-center justify-between gap-4 rounded-xl px-4 py-2.5"
              style={{ background: "var(--bg2)", border: "1px solid var(--bgold)" }}
            >
              <button
                onClick={() => handleNumTeamsChange(numTeams - 1)}
                className="w-10 h-10 rounded-[10px] text-[20px]"
                style={{ background: "var(--bg3)", color: "var(--text)" }}
              >
                −
              </button>
              <div className="font-[var(--font-head)] font-extrabold text-[26px]" style={{ color: "var(--gold)" }}>{numTeams}</div>
              <button
                onClick={() => handleNumTeamsChange(numTeams + 1)}
                className="w-10 h-10 rounded-[10px] text-[20px]"
                style={{ background: "var(--bg3)", color: "var(--text)" }}
              >
                +
              </button>
            </div>
            <div className="text-center text-[12px]" style={{ color: "var(--muted)" }}>
              {presentIds.length} jogadores presentes serão distribuídos por estrelas (snake draft).
            </div>
          </div>
        )}

        {error && (
          <div className="text-[12px] font-semibold text-center" style={{ color: "var(--red)" }}>
            {error}
          </div>
        )}
      </ScreenBody>
      <BottomCTA>
        <div className="flex gap-2.5">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="rounded-xl px-5 py-4 font-[var(--font-head)] font-extrabold text-[14px] uppercase tracking-wide min-h-[44px]"
              style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
            >
              Voltar
            </button>
          )}
          {step === 1 && (
            <button
              onClick={handleCreatePelada}
              disabled={isPending || !date}
              className="flex-1 rounded-xl py-4 font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wider disabled:opacity-40 min-h-[44px]"
              style={{ background: "var(--gold)", color: "#141414", boxShadow: "0 8px 24px oklch(0.80 0.16 86 / .25)" }}
            >
              {isPending ? "Salvando..." : "Próximo"}
            </button>
          )}
          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              disabled={presentIds.length < 2}
              className="flex-1 rounded-xl py-4 font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wider disabled:opacity-40 min-h-[44px]"
              style={{ background: "var(--gold)", color: "#141414", boxShadow: "0 8px 24px oklch(0.80 0.16 86 / .25)" }}
            >
              Próximo
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handleSortear}
              disabled={presentIds.length < numTeams || isPending}
              className="flex-1 rounded-xl py-4 font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wider disabled:opacity-40 min-h-[44px]"
              style={{ background: "var(--gold)", color: "#141414", boxShadow: "0 8px 24px oklch(0.80 0.16 86 / .25)" }}
            >
              {isPending ? "Sorteando..." : "Sortear Times"}
            </button>
          )}
        </div>
      </BottomCTA>
    </>
  );
}
