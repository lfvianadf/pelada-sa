"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ScreenBody, BottomCTA } from "@/components/Screen";
import { Stars } from "@/components/Stars";
import { Avatar } from "@/components/Avatar";
import { IconDownload } from "@/components/icons";
import { ExportPreviewModal } from "@/components/ExportPreviewModal";
import { teamColor, type PlayerRow, type TeamRow } from "@/lib/domain";
import { renameTeam, swapPlayers, confirmTeams } from "@/lib/actions";
import { captureElementAsPng } from "@/lib/exportPng";
import { TeamsExportCard } from "./teams-export-card";

interface TeamPlayerRow {
  team_id: number;
  player_id: number;
}

type SwapStep = "closed" | "team" | "player";

export function SorteioBoard({
  peladaId,
  teams,
  teamPlayers,
  players,
  hasGames,
}: {
  peladaId: number;
  teams: TeamRow[];
  teamPlayers: TeamPlayerRow[];
  players: PlayerRow[];
  hasGames: boolean;
}) {
  const router = useRouter();
  const [names, setNames] = useState<Record<number, string>>(Object.fromEntries(teams.map((t) => [t.id, t.name])));
  const [assignments, setAssignments] = useState<TeamPlayerRow[]>(teamPlayers);
  const [openTeamId, setOpenTeamId] = useState<number | null>(teams[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDataUrl, setExportDataUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const exportRef = useRef<HTMLDivElement>(null);

  async function handleExport() {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await captureElementAsPng(exportRef.current);
      setExportDataUrl(dataUrl);
    } catch {
      setError("Não foi possível gerar a imagem.");
    } finally {
      setIsExporting(false);
    }
  }

  const [swapStep, setSwapStep] = useState<SwapStep>("closed");
  const [swapPlayerId, setSwapPlayerId] = useState<number | null>(null);
  const [swapFromTeamId, setSwapFromTeamId] = useState<number | null>(null);
  const [swapToTeamId, setSwapToTeamId] = useState<number | null>(null);

  function playerName(id: number) {
    return players.find((p) => p.id === id)?.name ?? "";
  }
  function playerStars(id: number) {
    return players.find((p) => p.id === id)?.stars ?? 0;
  }
  function teamPlayerIdsOf(teamId: number) {
    return assignments.filter((a) => a.team_id === teamId).map((a) => a.player_id);
  }

  function handleRename(teamId: number, name: string) {
    setNames((prev) => ({ ...prev, [teamId]: name }));
    startTransition(async () => {
      await renameTeam(teamId, name);
    });
  }

  function openSwap(fromTeamId: number, playerId: number) {
    setSwapFromTeamId(fromTeamId);
    setSwapPlayerId(playerId);
    setSwapToTeamId(null);
    setSwapStep("team");
  }

  function closeSwap() {
    setSwapStep("closed");
    setSwapPlayerId(null);
    setSwapFromTeamId(null);
    setSwapToTeamId(null);
  }

  function handlePickDestTeam(teamId: number) {
    setSwapToTeamId(teamId);
    setSwapStep("player");
  }

  function handlePickSwapTarget(targetPlayerId: number) {
    if (swapFromTeamId === null || swapToTeamId === null || swapPlayerId === null) return;
    const fromTeamId = swapFromTeamId;
    const toTeamId = swapToTeamId;
    const playerId = swapPlayerId;
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.team_id === fromTeamId && a.player_id === playerId) return { ...a, team_id: toTeamId };
        if (a.team_id === toTeamId && a.player_id === targetPlayerId) return { ...a, team_id: fromTeamId };
        return a;
      }),
    );
    closeSwap();
    startTransition(async () => {
      await swapPlayers(fromTeamId, playerId, toTeamId, targetPlayerId);
    });
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await confirmTeams(peladaId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/jogos?pelada=${peladaId}`);
    });
  }

  const swapTeam = swapToTeamId ? teams.find((t) => t.id === swapToTeamId) : null;
  const swapTeamPlayerIds = swapToTeamId ? teamPlayerIdsOf(swapToTeamId) : [];

  return (
    <>
      <ScreenBody className="pb-3 gap-3">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[12px] uppercase tracking-wide min-h-[44px] disabled:opacity-60"
          style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
        >
          <IconDownload size={16} />
          {isExporting ? "Gerando imagem..." : "Exportar PNG"}
        </button>

        {teams.map((t) => {
          const color = teamColor(t.hue);
          const teamPlayerIds = teamPlayerIdsOf(t.id);
          const starSum = teamPlayerIds.reduce((sum, id) => sum + playerStars(id), 0);
          const open = openTeamId === t.id;
          return (
            <div key={t.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}>
              <div style={{ height: 4, background: color }} />
              <button
                onClick={() => setOpenTeamId(open ? null : t.id)}
                className="w-full flex items-center gap-2.5 p-3.5 text-left min-h-[44px]"
              >
                <input
                  value={names[t.id] ?? t.name}
                  onChange={(e) => handleRename(t.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 rounded-lg px-3 py-2.5 font-[var(--font-head)] font-extrabold text-[15px] uppercase tracking-wide min-w-0"
                  style={{ background: "var(--bg3)", border: "1px solid var(--hairline)", color }}
                />
                <div className="flex items-center gap-1 rounded-full px-3 py-1.5 shrink-0" style={{ background: "oklch(1 0 0 / .05)" }}>
                  <span className="text-[13px]" style={{ color: "var(--gold)" }}>★</span>
                  <span className="font-[var(--font-head)] font-extrabold text-[14px]" style={{ color: "var(--gold)" }}>{starSum}</span>
                </div>
                <span
                  className="text-[10px] font-bold shrink-0 transition-transform"
                  style={{ color: "var(--muted)", transform: open ? "rotate(180deg)" : "none" }}
                >
                  ▾
                </span>
              </button>
              {open && (
                <div className="px-3.5 pb-3.5 flex flex-col gap-1.5">
                  {teamPlayerIds.map((id) => (
                    <button
                      key={id}
                      onClick={() => openSwap(t.id, id)}
                      className="flex items-center gap-2.5 py-2 px-1 rounded-lg text-left min-h-[44px]"
                      style={{ borderTop: "1px solid var(--hairline-soft)" }}
                    >
                      <Avatar size={28} />
                      <div className="flex-1 text-[13px] font-bold">{playerName(id)}</div>
                      <Stars value={playerStars(id)} size={12} />
                      <span className="text-[10px] font-bold uppercase" style={{ color: "var(--muted2)" }}>Trocar</span>
                    </button>
                  ))}
                  {teamPlayerIds.length === 0 && (
                    <div className="text-center text-[12px] py-3" style={{ color: "var(--muted2)" }}>
                      Nenhum jogador neste time.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {error && (
          <div className="text-[12px] font-semibold text-center" style={{ color: "var(--red)" }}>
            {error}
          </div>
        )}
      </ScreenBody>
      {!hasGames && (
        <BottomCTA>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="w-full rounded-xl py-4 font-[var(--font-head)] font-extrabold text-[15px] uppercase tracking-wide min-h-[44px] disabled:opacity-60"
            style={{ background: "var(--gold)", color: "#141414" }}
          >
            {isPending ? "Confirmando..." : "Confirmar Times e Gerar Jogos"}
          </button>
        </BottomCTA>
      )}

      {swapStep !== "closed" && swapPlayerId !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,.6)" }} onClick={closeSwap}>
          <div
            className="w-full max-w-[480px] rounded-t-[28px] p-5 pb-8 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
            style={{ background: "var(--bg)", border: "1px solid var(--hairline)", borderBottom: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto" style={{ background: "var(--hairline)" }} />

            {swapStep === "team" && (
              <>
                <div className="font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide text-center">
                  Trocar {playerName(swapPlayerId)} para qual time?
                </div>
                <div className="flex flex-col gap-2.5">
                  {teams
                    .filter((t) => t.id !== swapFromTeamId)
                    .map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handlePickDestTeam(t.id)}
                        className="rounded-2xl py-4 font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wide min-h-[44px]"
                        style={{ background: "var(--bg2)", border: `1.5px solid ${teamColor(t.hue)}`, color: teamColor(t.hue) }}
                      >
                        {names[t.id] ?? t.name}
                      </button>
                    ))}
                </div>
              </>
            )}

            {swapStep === "player" && swapTeam && (
              <>
                <div className="font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide text-center">
                  Trocar com quem no {names[swapTeam.id] ?? swapTeam.name}?
                </div>
                <div className="text-center text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
                  {playerName(swapPlayerId)} vai para {names[swapTeam.id] ?? swapTeam.name}
                </div>
                <div className="flex flex-col gap-2">
                  {swapTeamPlayerIds.map((id) => (
                    <button
                      key={id}
                      onClick={() => handlePickSwapTarget(id)}
                      className="flex items-center gap-2.5 rounded-xl py-3.5 px-4 text-left min-h-[44px]"
                      style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}
                    >
                      <Avatar size={28} />
                      <span className="font-bold text-[15px] flex-1">{playerName(id)}</span>
                      <Stars value={playerStars(id)} size={12} />
                    </button>
                  ))}
                  {swapTeamPlayerIds.length === 0 && (
                    <div className="text-center text-[13px] py-4" style={{ color: "var(--muted2)" }}>
                      Esse time não tem jogadores para trocar.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ position: "fixed", top: 0, left: "-9999px", pointerEvents: "none" }}>
        <div ref={exportRef}>
          <TeamsExportCard
            teams={teams}
            names={names}
            teamPlayerIdsOf={teamPlayerIdsOf}
            playerName={playerName}
            playerStars={playerStars}
          />
        </div>
      </div>

      {exportDataUrl && (
        <ExportPreviewModal dataUrl={exportDataUrl} filename="times-sorteados.png" onClose={() => setExportDataUrl(null)} />
      )}
    </>
  );
}
