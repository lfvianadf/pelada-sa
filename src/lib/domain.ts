import type { Tables } from "./database.types";
import type { Position } from "./types";

export type PlayerRow = Tables<"players">;
export type TeamRow = Tables<"teams">;
export type GameRow = Tables<"games">;
export type MatchEventRow = Tables<"match_events">;

export function teamColor(hue: number) {
  return `oklch(0.62 0.16 ${hue})`;
}

export function starsArray(n: number) {
  return Array.from({ length: 5 }, (_, i) => Math.min(1, Math.max(0, n - i)));
}

export interface PositionalGameStat {
  position: Position;
  won: boolean;
  cleanSheet: boolean;
  goals: number;
  assists: number;
}

const POSITION_WEIGHTS: Record<Position, { goal: number; assist: number; defense: number }> = {
  Goleiro: { goal: 1.5, assist: 1.0, defense: 2.5 },
  Zagueiro: { goal: 1.8, assist: 1.2, defense: 2.0 },
  "Meio-campo": { goal: 2.0, assist: 1.8, defense: 1.0 },
  Atacante: { goal: 2.2, assist: 1.3, defense: 0.8 },
  Qualquer: { goal: 2.0, assist: 1.5, defense: 1.5 },
};

export function rawScoreForPlayer(games: PositionalGameStat[]): number | null {
  if (games.length === 0) return null;
  const total = games.reduce((sum, g) => {
    const w = POSITION_WEIGHTS[g.position];
    return sum + w.goal * g.goals + w.assist * g.assists + w.defense * (g.cleanSheet ? 1 : 0) + (g.won ? 1 : 0);
  }, 0);
  return total / games.length;
}

export function starDeltaFromZScore(z: number): number {
  if (z <= -1.2) return -0.4;
  if (z <= -0.4) return -0.2;
  if (z <= 0.4) return 0;
  if (z <= 1.2) return 0.2;
  return 0.4;
}

export function clampStars(value: number): number {
  return Math.round(Math.min(5, Math.max(1, value)) * 10) / 10;
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
