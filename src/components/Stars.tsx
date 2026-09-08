import { starsArray } from "@/lib/domain";

export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-[1px]">
      {starsArray(value).map((fill, i) => (
        <span key={i} style={{ position: "relative", display: "inline-block", fontSize: size, lineHeight: 1 }}>
          <span style={{ color: "oklch(1 0 0 / .18)" }}>★</span>
          {fill > 0 && (
            <span
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                width: `${fill * 100}%`,
                color: "var(--gold)",
                whiteSpace: "nowrap",
              }}
            >
              ★
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
