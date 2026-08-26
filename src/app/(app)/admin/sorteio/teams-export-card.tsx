import { teamColor, type TeamRow } from "@/lib/domain";
import { Stars } from "@/components/Stars";
import { Avatar } from "@/components/Avatar";

export function TeamsExportCard({
  teams,
  names,
  teamPlayerIdsOf,
  playerName,
  playerStars,
}: {
  teams: TeamRow[];
  names: Record<number, string>;
  teamPlayerIdsOf: (teamId: number) => number[];
  playerName: (id: number) => string;
  playerStars: (id: number) => number;
}) {
  return (
    <div className="flex flex-col gap-4 p-6" style={{ background: "var(--bg)", width: 480 }}>
      <div className="text-center font-[var(--font-head)] font-extrabold text-[22px] uppercase tracking-wide">
        Times Sorteados <span style={{ color: "var(--gold)" }}>· Santo Afonso</span>
      </div>
      {teams.map((t) => {
        const color = teamColor(t.hue);
        const teamPlayerIds = teamPlayerIdsOf(t.id);
        const starSum = teamPlayerIds.reduce((sum, id) => sum + playerStars(id), 0);
        return (
          <div key={t.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}>
            <div style={{ height: 5, background: color }} />
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2.5">
                <div
                  className="font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide"
                  style={{ color }}
                >
                  {names[t.id] ?? t.name}
                </div>
                <div className="flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background: "oklch(1 0 0 / .05)" }}>
                  <span className="text-[13px]" style={{ color: "var(--gold)" }}>★</span>
                  <span className="font-[var(--font-head)] font-extrabold text-[14px]" style={{ color: "var(--gold)" }}>{starSum}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {teamPlayerIds.map((id) => (
                  <div key={id} className="flex items-center gap-2.5 py-1.5" style={{ borderTop: "1px solid var(--hairline-soft)" }}>
                    <Avatar size={28} />
                    <div className="flex-1 text-[13px] font-bold">{playerName(id)}</div>
                    <Stars value={playerStars(id)} size={12} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
