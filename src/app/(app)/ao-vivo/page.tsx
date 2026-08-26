import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { ScreenContent } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { AoVivoClient } from "./ao-vivo-client";
import { AoVivoStartList } from "./ao-vivo-start-list";

export default async function AoVivoPage() {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");

  const supabase = await createClient();

  const { data: latestPelada } = await supabase
    .from("peladas")
    .select("id")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const peladaId = latestPelada?.id;
  const [{ data: games }, { data: peladaRow }] = peladaId
    ? await Promise.all([
        supabase.from("games").select("*").eq("pelada_id", peladaId).order("id"),
        supabase.from("peladas").select("duration_minutes").eq("id", peladaId).single(),
      ])
    : [{ data: [] }, { data: null }];

  const durationMinutes = peladaRow?.duration_minutes ?? 10;

  const liveGame = (games ?? []).find((g) => g.status === "ao vivo") ?? null;
  const scheduled = (games ?? []).filter((g) => g.status === "agendado");

  if (!liveGame) {
    const teamIds = Array.from(new Set(scheduled.flatMap((g) => [g.team_a_id, g.team_b_id])));
    const { data: teams } = teamIds.length > 0 ? await supabase.from("teams").select("*").in("id", teamIds) : { data: [] };

    return (
      <ScreenContent>
        <TopBar title="Registro Ao Vivo" />
        <div className="flex-1 flex flex-col px-5 py-6 gap-4">
          <div className="text-center text-[13px] py-2.5" style={{ color: "var(--muted)" }}>
            Nenhum jogo ao vivo. {me.is_admin ? "Inicie um confronto agendado:" : "Aguarde um administrador iniciar um jogo."}
          </div>
          {me.is_admin && (
            <AoVivoStartList scheduled={scheduled} teams={teams ?? []} />
          )}
        </div>
      </ScreenContent>
    );
  }

  const [{ data: teamA }, { data: teamB }] = await Promise.all([
    supabase.from("teams").select("*").eq("id", liveGame.team_a_id).single(),
    supabase.from("teams").select("*").eq("id", liveGame.team_b_id).single(),
  ]);

  const [{ data: teamAPlayers }, { data: teamBPlayers }, { data: presence }] = await Promise.all([
    supabase.from("team_players").select("player_id").eq("team_id", liveGame.team_a_id),
    supabase.from("team_players").select("player_id").eq("team_id", liveGame.team_b_id),
    supabase.from("pelada_presence").select("player_id").eq("pelada_id", liveGame.pelada_id),
  ]);

  const playerIds = Array.from(
    new Set([
      ...(teamAPlayers ?? []).map((p) => p.player_id),
      ...(teamBPlayers ?? []).map((p) => p.player_id),
      ...(presence ?? []).map((p) => p.player_id),
    ]),
  );
  const { data: players } = playerIds.length > 0 ? await supabase.from("players").select("*").in("id", playerIds) : { data: [] };
  const { data: events } = await supabase.from("match_events").select("*").eq("game_id", liveGame.id).order("id");

  return (
    <ScreenContent>
      <AoVivoClient
        game={liveGame}
        teamA={teamA!}
        teamB={teamB!}
        teamAPlayerIds={(teamAPlayers ?? []).map((p) => p.player_id)}
        teamBPlayerIds={(teamBPlayers ?? []).map((p) => p.player_id)}
        players={players ?? []}
        events={events ?? []}
        isAdmin={me.is_admin}
        durationMinutes={durationMinutes}
      />
    </ScreenContent>
  );
}
