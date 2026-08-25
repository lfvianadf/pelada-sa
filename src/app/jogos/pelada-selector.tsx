"use client";

import { useRouter } from "next/navigation";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function PeladaSelector({
  peladas,
  selectedId,
}: {
  peladas: { id: number; date: string }[];
  selectedId: number | null;
}) {
  const router = useRouter();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
      {peladas.map((p) => {
        const active = p.id === selectedId;
        return (
          <button
            key={p.id}
            onClick={() => router.push(`/jogos?pelada=${p.id}`)}
            className="shrink-0 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-wide min-h-[36px]"
            style={{
              background: active ? "var(--gold)" : "var(--bg2)",
              color: active ? "#141414" : "var(--muted)",
              border: `1px solid ${active ? "var(--gold)" : "var(--hairline)"}`,
            }}
          >
            {formatDate(p.date)}
          </button>
        );
      })}
    </div>
  );
}
