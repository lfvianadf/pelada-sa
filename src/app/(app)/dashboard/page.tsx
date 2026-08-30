import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { standingsFor, fmtClock } from "@/lib/domain";
import { ScreenContent } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { DashboardBody } from "./dashboard-body";
import { ScopeSelector } from "./scope-selector";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");

  const supabase = await createClient();
  const { scope } = await searchParams;

  const { data: peladas } = await supabase.from("peladas").select("id, date").order("date", { ascending: false });
  const allPeladas = peladas ?? [];

  const years = Array.from(new Set(allPeladas.map((p) => p.date.slice(0, 4)))).sort((a, b) => b.localeCompare(a));

  let peladaIds: number[];
  if (!scope || scope === "all") {
    peladaIds = allPeladas.map((p) => p.id);
  } else if (scope.startsWith("year-")) {
    const year = scope.slice(5);
    peladaIds = allPeladas.filter((p) => p.date.startsWith(year)).map((p) => p.id);
  } else if (scope.startsWith("pelada-")) {
    const id = Number(scope.slice(7));
    peladaIds = allPeladas.some((p) => p.id === id) ? [id] : [];
  } else {
    peladaIds = allPeladas.map((p) => p.id);
  }

  const { data: players } = await supabase.from("players").select("*");
  const allPlayers = players ?? [];

  const [{ data: games }, { data: teams }] =
    peladaIds.length > 0
      ? await Promise.all([
          supabase.from("games").select("*").in("pelada_id", peladaIds),
          supabase.from("teams").select("*").in("pelada_id", peladaIds),
        ])
      : [{ data: [] }, { data: [] }];

  const allGames = games ?? [];
  const allTeams = teams ?? [];
  const gameIds = allGames.map((g) => g.id);

  const { data: events } =
    gameIds.length > 0 ? await supabase.from("match_events").select("*").in("game_id", gameIds) : { data: [] };
  const allEvents = events ?? [];

  function playerName(id: number) {
    return allPlayers.find((p) => p.id === id)?.name ?? "";
  }

  const goalCountsAll: Record<number, number> = {};
  const assistCountsAll: Record<number, number> = {};
  allEvents.forEach((e) => {
    if (e.type === "gol") goalCountsAll[e.player_id] = (goalCountsAll[e.player_id] ?? 0) + 1;
    else assistCountsAll[e.player_id] = (assistCountsAll[e.player_id] ?? 0) + 1;
  });

  const goalsRanking = Object.entries(goalCountsAll)
    .map(([playerId, goals]) => ({ player: allPlayers.find((p) => p.id === +playerId), goals }))
    .filter((r): r is { player: NonNullable<typeof r.player>; goals: number } => !!r.player)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  const assistsRanking = Object.entries(assistCountsAll)
    .map(([playerId, assists]) => ({ player: allPlayers.find((p) => p.id === +playerId), assists }))
    .filter((r): r is { player: NonNullable<typeof r.player>; assists: number } => !!r.player)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 5);

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

  const isSinglePelada = !!scope && scope.startsWith("pelada-");
  const rodadaLabel = isSinglePelada ? "na pelada" : "no período";

  const highlights = [
    { label: `Mais gols ${rodadaLabel}`, value: topTodayScorerId ? `${playerName(+topTodayScorerId)} (${goalCounts[+topTodayScorerId]})` : "—", color: "var(--gold)" },
    { label: "Gol mais rápido", value: fastestGoal ? `${playerName(fastestGoal.player_id)} · ${fmtClock(fastestGoal.sec)}` : "—", color: "var(--gold)" },
    { label: "Time mais seguro", value: safestTeam ? `${safestTeam.name} (${safestTeam.gs} sofridos)` : "—", color: "var(--green)" },
    { label: "Time que mais venceu", value: winningestTeam ? `${winningestTeam.name} (${winningestTeam.v}V)` : "—", color: "var(--green)" },
  ];

  return (
    <ScreenContent>
      <TopBar title="Raio-X" />
      <DashboardBody
        scopeSelector={<ScopeSelector peladas={allPeladas} years={years} selectedScope={scope ?? "all"} />}
        topScorer={topScorer ? { ...topScorer.player, goals: topScorer.goals } : undefined}
        topAssist={topAssist ? { ...topAssist.player, assists: topAssist.assists } : undefined}
        goalsRanking={goalsRanking.map((r) => ({ ...r.player, goals: r.goals }))}
        assistsRanking={assistsRanking.map((r) => ({ ...r.player, assists: r.assists }))}
        teamStandings={teamStandings}
        highlights={highlights}
      />
    </ScreenContent>
  );
}
