import type { Tables } from "./database.types";

export type PlayerRow = Tables<"players">;
export type TeamRow = Tables<"teams">;
export type GameRow = Tables<"games">;
export type MatchEventRow = Tables<"match_events">;

export function teamColor(hue: number) {
  return `oklch(0.62 0.16 ${hue})`;
}

export function starsArray(n: number) {
  return Array.from({ length: 5 }, (_, i) => i < n);
}

export function aiSuggestedStars(p: Pick<PlayerRow, "goals" | "assists" | "games" | "wins">): number {
  const score = p.goals * 2 + p.assists * 1.5 + p.wins;
  const per = p.games ? score / p.games : 0;
  if (per < 1.5) return 1;
  if (per < 3) return 2;
  if (per < 5) return 3;
  if (per < 7) return 4;
  return 5;
}

export interface Standing {
  teamId: number;
  name: string;
  color: string;
  j: number;
  v: number;
  e: number;
  d: number;
  gm: number;
  gs: number;
  sg: number;
  pts: number;
}

export function standingsFor(games: GameRow[], teams: TeamRow[]): Standing[] {
  const map: Record<number, Standing> = {};
  teams.forEach((t) => {
    map[t.id] = { teamId: t.id, name: t.name, color: teamColor(t.hue), j: 0, v: 0, e: 0, d: 0, gm: 0, gs: 0, sg: 0, pts: 0 };
  });
  games
    .filter((g) => g.status === "finalizado")
    .forEach((g) => {
      const a = map[g.team_a_id];
      const b = map[g.team_b_id];
      if (!a || !b || g.score_a === null || g.score_b === null) return;
      a.j++;
      b.j++;
      a.gm += g.score_a;
      a.gs += g.score_b;
      b.gm += g.score_b;
      b.gs += g.score_a;
      if (g.score_a > g.score_b) {
        a.v++;
        b.d++;
        a.pts += 3;
      } else if (g.score_a < g.score_b) {
        b.v++;
        a.d++;
        b.pts += 3;
      } else {
        a.e++;
        b.e++;
        a.pts++;
        b.pts++;
      }
    });
  Object.values(map).forEach((t) => (t.sg = t.gm - t.gs));
  return Object.values(map).sort((x, y) => y.pts - x.pts || y.sg - x.sg);
}

export const HUES = [86, 148, 220, 15, 300];

export function fmtClock(sec: number) {
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
