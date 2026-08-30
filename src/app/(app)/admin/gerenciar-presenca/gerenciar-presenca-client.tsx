"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ScreenBody, BottomCTA } from "@/components/Screen";
import { Stars } from "@/components/Stars";
import { Avatar } from "@/components/Avatar";
import { IconPlus } from "@/components/icons";
import type { Position } from "@/lib/types";
import type { PlayerRow } from "@/lib/domain";
import { createGuestPlayer, setPresence, updatePeladaNumTeams, sortear } from "@/lib/actions";

const POSITIONS: Position[] = ["Qualquer", "Goleiro", "Zagueiro", "Meio-campo", "Atacante"];

export function GerenciarPresencaClient({
  peladaId,
  players: initialPlayers,
  initialPresentIds,
  initialNumTeams,
}: {
  peladaId: number;
  players: PlayerRow[];
  initialPresentIds: number[];
  initialNumTeams: number;
}) {
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerRow[]>(initialPlayers);
  const [presentIds, setPresentIds] = useState<number[]>(initialPresentIds);
  const [numTeams, setNumTeams] = useState(initialNumTeams);
  const [playerSearch, setPlayerSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [guestOpen, setGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPosition, setGuestPosition] = useState<Position>("Qualquer");

  function handleToggle(playerId: number, present: boolean) {
    setError(null);
    setPresentIds((prev) => (present ? [...prev, playerId] : prev.filter((id) => id !== playerId)));
    startTransition(async () => {
      const result = await setPresence(peladaId, playerId, present);
      if (result.error) {
        setError(result.error);
        setPresentIds((prev) => (present ? prev.filter((id) => id !== playerId) : [...prev, playerId]));
      }
    });
  }

  function handleCreateGuest() {
    if (!guestName.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createGuestPlayer(guestName, guestPosition);
      if (result.error || !result.playerId) {
        setError(result.error ?? "Erro ao cadastrar jogador.");
        return;
      }
      const playerId = result.playerId;
      setPlayers((prev) => [...prev, { id: playerId, name: guestName.trim(), position: guestPosition, stars: 3 } as PlayerRow]);
      setGuestName("");
      setGuestPosition("Qualquer");
      setGuestOpen(false);

      const presenceResult = await setPresence(peladaId, playerId, true);
      if (presenceResult.error) {
        setError(presenceResult.error);
        return;
      }
      setPresentIds((prev) => [...prev, playerId]);
    });
  }

  function handleNumTeamsChange(n: number) {
    if (n < 2 || n > 5) return;
    setNumTeams(n);
    startTransition(async () => {
      await updatePeladaNumTeams(peladaId, n);
    });
  }

  function handleSortear() {
    setError(null);
    startTransition(async () => {
      const sortResult = await sortear(peladaId);
      if (sortResult.error) {
        setError(sortResult.error);
        return;
      }
      router.push(`/admin/sorteio?pelada=${peladaId}`);
    });
  }

  const filteredPlayers = players.filter((p) => p.name.toLowerCase().includes(playerSearch.trim().toLowerCase()));

  return (
    <>
      <ScreenBody className="pb-3">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Jogadores confirmados
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

        <input
          value={playerSearch}
          onChange={(e) => setPlayerSearch(e.target.value)}
          placeholder="Buscar jogador..."
          className="rounded-[10px] px-3.5 py-2.5 text-[14px]"
          style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
        />

        <div className="flex flex-col gap-2">
          {filteredPlayers.map((p) => {
            const present = presentIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => handleToggle(p.id, !present)}
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
          {filteredPlayers.length === 0 && (
            <div className="text-center text-[13px] py-4" style={{ color: "var(--muted2)" }}>
              Nenhum jogador encontrado.
            </div>
          )}
        </div>

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
            {presentIds.length} jogadores confirmados serão distribuídos por estrelas (snake draft).
          </div>
        </div>

        {error && (
          <div className="text-[12px] font-semibold text-center" style={{ color: "var(--red)" }}>
            {error}
          </div>
        )}
      </ScreenBody>
      <BottomCTA>
        <button
          onClick={handleSortear}
          disabled={presentIds.length < numTeams || isPending}
          className="w-full rounded-xl py-4 font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wider disabled:opacity-40 min-h-[44px]"
          style={{ background: "var(--gold)", color: "#141414", boxShadow: "0 8px 24px oklch(0.80 0.16 86 / .25)" }}
        >
          {isPending ? "Sorteando..." : "Sortear Times"}
        </button>
      </BottomCTA>
    </>
  );
}
