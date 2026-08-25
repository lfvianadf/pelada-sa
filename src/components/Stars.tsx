import { starsArray } from "@/lib/domain";

export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-[1px]">
      {starsArray(value).map((filled, i) => (
        <span key={i} style={{ fontSize: size, color: filled ? "var(--gold)" : "oklch(1 0 0 / .18)" }}>
          ★
        </span>
      ))}
    </div>
  );
}
