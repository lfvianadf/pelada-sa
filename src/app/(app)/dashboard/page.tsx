import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { standingsFor, fmtClock } from "@/lib/domain";
import { ScreenContent, ScreenBody } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { Avatar } from "@/components/Avatar";
import { PeriodTabs } from "./period-tabs";

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
      <ScreenBody>
        <PeriodTabs />

        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-3.5 flex flex-col items-center gap-2"
            style={{ background: "linear-gradient(160deg,oklch(0.80 0.16 86 / .18),var(--bg2))", border: "1px solid var(--bgold)" }}
          >
            <Avatar size={52} gold />
            <div className="font-[var(--font-head)] font-extrabold text-[14px] text-center uppercase">{topScorer?.name ?? "—"}</div>
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Artilheiro</div>
            <div className="font-[var(--font-head)] font-extrabold text-[20px]" style={{ color: "var(--gold)" }}>{topScorer?.goals ?? 0} gols</div>
          </div>
          <div
            className="rounded-2xl p-3.5 flex flex-col items-center gap-2"
            style={{ background: "linear-gradient(160deg,oklch(0.72 0.17 148 / .18),var(--bg2))", border: "1px solid oklch(0.72 0.17 148 / .3)" }}
          >
            <Avatar size={52} />
            <div className="font-[var(--font-head)] font-extrabold text-[14px] text-center uppercase">{topAssist?.name ?? "—"}</div>
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Garçom da Rodada</div>
            <div className="font-[var(--font-head)] font-extrabold text-[20px]" style={{ color: "var(--green)" }}>{topAssist?.assists ?? 0} assist.</div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Ranking de Gols</div>
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}>
            {goalsRanking.map((r, i) => (
              <div key={r.id} className="flex items-center gap-2.5 px-3.5 py-2.5" style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
                <div className="font-[var(--font-head)] font-extrabold text-[12px] w-4" style={{ color: "var(--muted2)" }}>{i + 1}</div>
                <Avatar size={26} />
                <div className="flex-1 text-[13px] font-bold">{r.name}</div>
                <div className="font-[var(--font-head)] font-extrabold text-[15px]" style={{ color: "var(--gold)" }}>{r.goals}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Ranking de Assistências</div>
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}>
            {assistsRanking.map((r, i) => (
              <div key={r.id} className="flex items-center gap-2.5 px-3.5 py-2.5" style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
                <div className="font-[var(--font-head)] font-extrabold text-[12px] w-4" style={{ color: "var(--muted2)" }}>{i + 1}</div>
                <Avatar size={26} />
                <div className="flex-1 text-[13px] font-bold">{r.name}</div>
                <div className="font-[var(--font-head)] font-extrabold text-[15px]" style={{ color: "var(--green)" }}>{r.assists}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Desempenho por Time</div>
          <div className="rounded-xl overflow-x-auto" style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}>
            <div
              className="grid px-3 py-2.5 text-[9px] font-bold tracking-wide min-w-[380px]"
              style={{ gridTemplateColumns: "1.4fr .45fr .45fr .45fr .45fr .5fr .5fr .5fr", color: "var(--muted2)" }}
            >
              <div>TIME</div><div className="text-center">J</div><div className="text-center">V</div><div className="text-center">E</div>
              <div className="text-center">D</div><div className="text-center">GM</div><div className="text-center">GS</div><div className="text-center">SG</div>
            </div>
            {teamStandings.map((r) => (
              <div
                key={r.teamId}
                className="grid px-3 py-2.5 text-[11px] font-semibold items-center min-w-[380px]"
                style={{ gridTemplateColumns: "1.4fr .45fr .45fr .45fr .45fr .5fr .5fr .5fr", borderTop: "1px solid var(--hairline-soft)" }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  {r.name}
                </div>
                <div className="text-center">{r.j}</div>
                <div className="text-center" style={{ color: "var(--green)" }}>{r.v}</div>
                <div className="text-center">{r.e}</div>
                <div className="text-center" style={{ color: "var(--red)" }}>{r.d}</div>
                <div className="text-center">{r.gm}</div>
                <div className="text-center">{r.gs}</div>
                <div className="text-center" style={{ color: "var(--gold)" }}>{r.sg}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Destaques da Rodada</div>
          <div className="grid grid-cols-2 gap-2.5">
            {highlights.map((h) => (
              <div key={h.label} className="rounded-xl p-3 flex flex-col gap-1" style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}>
                <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{h.label}</div>
                <div className="font-[var(--font-head)] font-extrabold text-[15px]" style={{ color: h.color }}>{h.value}</div>
              </div>
            ))}
          </div>
        </div>
      </ScreenBody>
    </ScreenContent>
  );
}
