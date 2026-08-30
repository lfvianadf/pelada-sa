import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { standingsFor } from "@/lib/domain";
import { ScreenContent, ScreenBody } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { JogosList } from "./jogos-list";
import { PeladaSelector } from "./pelada-selector";
import { AdminActions } from "./admin-actions";
import { PresenceCard } from "./presence-card";

export default async function JogosPage({
  searchParams,
}: {
  searchParams: Promise<{ pelada?: string }>;
}) {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");

  const { pelada } = await searchParams;
  const supabase = await createClient();

  const { data: peladas } = await supabase.from("peladas").select("id, date").order("date", { ascending: false });

  const peladaId = pelada ? Number(pelada) : peladas?.[0]?.id;

  const [{ data: games }, { data: teams }, { data: peladaRow }] = peladaId
    ? await Promise.all([
        supabase.from("games").select("*").eq("pelada_id", peladaId).order("id"),
        supabase.from("teams").select("*").eq("pelada_id", peladaId).order("queue_order"),
        supabase.from("peladas").select("date, format, finished").eq("id", peladaId).single(),
      ])
    : [{ data: [] }, { data: [] }, { data: null }];

  const liveGameIds = (games ?? []).filter((g) => g.status === "ao vivo").map((g) => g.id);
  const teamIds = (teams ?? []).map((t) => t.id);
  const hasTeams = (teams ?? []).length > 0;

  const [{ data: liveEvents }, { data: teamPlayers }, { data: presence }] = await Promise.all([
    liveGameIds.length > 0
      ? supabase.from("match_events").select("game_id, player_id, type").in("game_id", liveGameIds)
      : Promise.resolve({ data: [] }),
    teamIds.length > 0 ? supabase.from("team_players").select("team_id, player_id").in("team_id", teamIds) : Promise.resolve({ data: [] }),
    peladaId && !hasTeams
      ? supabase.from("pelada_presence").select("player_id").eq("pelada_id", peladaId)
      : Promise.resolve({ data: [] }),
  ]);

  const standings = standingsFor(games ?? [], teams ?? []);
  const format = peladaRow?.format ?? "todos_contra_todos";
  const isFinished = peladaRow?.finished ?? false;
  const queuedTeams = (teams ?? []).filter((t) => t.queue_order !== null);
  const confirmedIds = (presence ?? []).map((p) => p.player_id);

  return (
    <ScreenContent>
      <TopBar title="Jogos do Dia" />
      <ScreenBody>
        {(peladas ?? []).length > 0 && (
          <PeladaSelector peladas={peladas ?? []} selectedId={peladaId ?? null} isAdmin={me.is_admin} />
        )}

        {peladaId && !hasTeams && peladaRow && (
          <PresenceCard
            peladaId={peladaId}
            date={peladaRow.date}
            alreadyConfirmed={confirmedIds.includes(me.id)}
            confirmedCount={confirmedIds.length}
          />
        )}

        {peladaId && isFinished && (
          <div
            className="rounded-xl px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide"
            style={{ background: "oklch(0.72 0.17 148 / .12)", color: "var(--green)", border: "1px solid oklch(0.72 0.17 148 / .3)" }}
          >
            Pelada encerrada
          </div>
        )}

        {me.is_admin && <AdminActions peladaId={peladaId ?? null} hasTeams={hasTeams} isFinished={isFinished} />}

        {!peladaId && (
          <div className="text-center text-[13px] py-6" style={{ color: "var(--muted2)" }}>
            {me.is_admin ? "Crie uma pelada para começar." : "Nenhuma pelada cadastrada ainda."}
          </div>
        )}

        {peladaId && (
          <JogosList
            games={games ?? []}
            teams={teams ?? []}
            standings={standings}
            isAdmin={me.is_admin && !isFinished}
            format={format}
            liveEvents={liveEvents ?? []}
            teamPlayers={teamPlayers ?? []}
          />
        )}

        {peladaId && format === "vencedor_fica" && queuedTeams.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              Fila de espera
            </div>
            <div className="flex flex-col gap-2">
              {queuedTeams.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                  style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}
                >
                  <span className="font-[var(--font-head)] font-extrabold text-[13px]" style={{ color: "var(--muted2)" }}>
                    {t.queue_order}
                  </span>
                  <span className="text-[14px] font-bold">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ScreenBody>
    </ScreenContent>
  );
}
