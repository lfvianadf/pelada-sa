import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { standingsFor, fmtClock } from "@/lib/domain";
import { ScreenContent } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { DashboardBody } from "./dashboard-body";

export default async function DashboardPage() {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");

  const supabase = await createClient();

  const { data: players } = await supabase.from("players").select("*");
  const { data: latestPelada } = await supabase
    .from("peladas")
    .select("id")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  const peladaId = latestPelada?.id;

  const [{ data: games }, { data: teams }] = peladaId
    ? await Promise.all([
        supabase.from("games").select("*").eq("pelada_id", peladaId),
        supabase.from("teams").select("*").eq("pelada_id", peladaId),
      ])
    : [{ data: [] }, { data: [] }];

  const gameIds = (games ?? []).map((g) => g.id);
  const { data: events } =
    gameIds.length > 0
      ? await supabase.from("match_events").select("*").in("game_id", gameIds)
      : { data: [] };

  const allPlayers = players ?? [];
  const allGames = games ?? [];
  const allTeams = teams ?? [];
  const allEvents = events ?? [];

  const goalsRanking = [...allPlayers].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const assistsRanking = [...allPlayers].sort((a, b) => b.assists - a.assists).slice(0, 5);
  const topScorer = goalsRanking[0];
  const topAssist = assistsRanking[0];
  const teamStandings = standingsFor(allGames, allTeams);

  const goalEvents = allEvents.filter((e) => e.type === "gol");
  const goalCounts: Record<number, number> = {};
  goalEvents.forEach((e) => (goalCounts[e.player_id] = (goalCounts[e.player_id] ?? 0) + 1));
  const topTodayScorerId = Object.keys(goalCounts).sort((a, b) => goalCounts[+b] - goalCounts[+a])[0];
  const fastestGoal = [...goalEvents].sort((a, b) => a.sec - b.sec)[0];
  const safestTeam = [...teamStandings].sort((a, b) => a.gs - b.gs)[0];
  const winningestTeam = [...teamStandings].sort((a, b) => b.v - a.v)[0];

  function playerName(id: number) {
    return allPlayers.find((p) => p.id === id)?.name ?? "";
  }

  const highlights = [
    { label: "Mais gols na rodada", value: topTodayScorerId ? `${playerName(+topTodayScorerId)} (${goalCounts[+topTodayScorerId]})` : "—", color: "var(--gold)" },
    { label: "Gol mais rápido", value: fastestGoal ? `${playerName(fastestGoal.player_id)} · ${fmtClock(fastestGoal.sec)}` : "—", color: "var(--gold)" },
    { label: "Time mais seguro", value: safestTeam ? `${safestTeam.name} (${safestTeam.gs} sofridos)` : "—", color: "var(--green)" },
    { label: "Time que mais venceu", value: winningestTeam ? `${winningestTeam.name} (${winningestTeam.v}V)` : "—", color: "var(--green)" },
  ];

  return (
    <ScreenContent>
      <TopBar title="Raio-X da Pelada" />
      <DashboardBody
        topScorer={topScorer}
        topAssist={topAssist}
        goalsRanking={goalsRanking}
        assistsRanking={assistsRanking}
        teamStandings={teamStandings}
        highlights={highlights}
      />
    </ScreenContent>
  );
}
