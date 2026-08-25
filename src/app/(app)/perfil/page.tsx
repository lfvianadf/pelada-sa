import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { ScreenContent, ScreenBody } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { Stars } from "@/components/Stars";

function StatCard({ label, value, color, gold }: { label: string; value: number; color?: string; gold?: boolean }) {
  return (
    <div
      className="rounded-[14px] p-4 flex flex-col gap-0.5"
      style={{ background: "var(--bg2)", border: gold ? "1px solid var(--bgold)" : color ? `1px solid ${color}` : "1px solid var(--hairline)" }}
    >
      <div className="font-[var(--font-head)] font-extrabold text-[32px] leading-none" style={{ color: color ?? "var(--text)" }}>
        {value}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
        {label}
      </div>
    </div>
  );
}

interface HistoryEntry {
  date: string;
  result: string;
  personal: string;
}

export default async function PerfilPage() {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");

  const supabase = await createClient();

  const { data: myTeamPlayers } = await supabase.from("team_players").select("team_id").eq("player_id", me.id);
  const myTeamIds = (myTeamPlayers ?? []).map((tp) => tp.team_id);

  let history: HistoryEntry[] = [];

  if (myTeamIds.length > 0) {
    const { data: games } = await supabase
      .from("games")
      .select("id, team_a_id, team_b_id, score_a, score_b, status, pelada_id, peladas(date)")
      .eq("status", "finalizado")
      .or(`team_a_id.in.(${myTeamIds.join(",")}),team_b_id.in.(${myTeamIds.join(",")})`)
      .order("id", { ascending: false })
      .limit(10);

    if (games && games.length > 0) {
      const teamIds = Array.from(new Set(games.flatMap((g) => [g.team_a_id, g.team_b_id])));
      const { data: teams } = await supabase.from("teams").select("id, name").in("id", teamIds);
      const teamName = (id: number) => teams?.find((t) => t.id === id)?.name ?? "";

      const gameIds = games.map((g) => g.id);
      const { data: myEvents } = await supabase
        .from("match_events")
        .select("game_id, type")
        .eq("player_id", me.id)
        .in("game_id", gameIds);

      history = games.map((g) => {
        const goals = (myEvents ?? []).filter((e) => e.game_id === g.id && e.type === "gol").length;
        const assists = (myEvents ?? []).filter((e) => e.game_id === g.id && e.type === "assistencia").length;
        const parts: string[] = [];
        if (goals > 0) parts.push(`${goals} gol${goals > 1 ? "s" : ""}`);
        if (assists > 0) parts.push(`${assists} assistência${assists > 1 ? "s" : ""}`);
        const peladaDate = (g as unknown as { peladas: { date: string } | null }).peladas?.date;
        return {
          date: peladaDate ? new Date(peladaDate + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "",
          result: `${teamName(g.team_a_id)} ${g.score_a} x ${g.score_b} ${teamName(g.team_b_id)}`,
          personal: parts.length > 0 ? parts.join(" · ") : "Sem participação registrada",
        };
      });
    }
  }

  return (
    <ScreenContent>
      <TopBar title="Meu Perfil" />
      <ScreenBody>
        <div className="flex flex-col items-center gap-2.5">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{ background: "var(--bg2)", border: "3px solid var(--gold)", color: "var(--muted2)" }}
          >
            FOTO
          </div>
          <div className="font-[var(--font-head)] font-extrabold text-[26px] uppercase tracking-wide">{me.name}</div>
          <div
            className="text-[11px] font-bold uppercase tracking-wide rounded-full px-3 py-1"
            style={{ color: "var(--gold)", background: "oklch(0.80 0.16 86 / .12)", border: "1px solid var(--bgold)" }}
          >
            {me.position}
          </div>
          <div className="mt-1">
            <Stars value={me.stars} size={22} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Gols" value={me.goals} color="var(--gold)" gold />
          <StatCard label="Assistências" value={me.assists} color="var(--green)" />
          <StatCard label="Jogos" value={me.games} />
          <StatCard label="Vitórias" value={me.wins} />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Histórico recente
          </div>
          {history.length > 0 ? (
            <div className="flex flex-col gap-2">
              {history.map((h, i) => (
                <div key={i} className="rounded-xl p-3.5 flex flex-col gap-1" style={{ background: "var(--bg2)", border: "1px solid var(--hairline-soft)" }}>
                  <div className="text-[12px] font-semibold" style={{ color: "var(--muted)" }}>{h.date}</div>
                  <div className="text-[14px] font-bold">{h.result}</div>
                  <div className="text-[12px] font-semibold" style={{ color: "var(--gold)" }}>{h.personal}</div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-4.5 text-center text-[13px] rounded-xl"
              style={{ color: "var(--muted2)", background: "var(--bg2)", border: "1px dashed var(--hairline)" }}
            >
              Nenhuma pelada registrada ainda
            </div>
          )}
        </div>
      </ScreenBody>
    </ScreenContent>
  );
}
