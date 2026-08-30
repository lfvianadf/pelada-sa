"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ScreenBody, BottomCTA } from "@/components/Screen";
import type { Database } from "@/lib/database.types";
import { createPelada } from "@/lib/actions";

type PeladaFormat = Database["public"]["Enums"]["pelada_format"];

const DURATION_PRESETS = [2, 7, 10];

export function NovaPeladaForm({ initialDate }: { initialDate: string }) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [format, setFormat] = useState<PeladaFormat>("todos_contra_todos");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createPelada(date, durationMinutes, format);
      if (result.error || !result.peladaId) {
        setError(result.error ?? "Erro ao criar pelada.");
        return;
      }
      router.push(`/admin/gerenciar-presenca?pelada=${result.peladaId}`);
    });
  }

  return (
    <>
      <ScreenBody className="pb-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Data da pelada
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-[10px] px-3.5 py-3 text-[15px]"
            style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
          />
        </label>

        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Duração do jogo
          </span>
          <div className="flex gap-2">
            {DURATION_PRESETS.map((min) => (
              <button
                key={min}
                onClick={() => setDurationMinutes(min)}
                className="flex-1 rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[15px]"
                style={{
                  background: durationMinutes === min ? "var(--gold)" : "var(--bg2)",
                  color: durationMinutes === min ? "#141414" : "var(--text)",
                  border: `1px solid ${durationMinutes === min ? "var(--gold)" : "var(--hairline)"}`,
                }}
              >
                {min} min
              </button>
            ))}
          </div>
          <div
            className="flex items-center justify-between gap-4 rounded-xl px-4 py-2.5"
            style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}
          >
            <button
              onClick={() => setDurationMinutes((d) => Math.max(1, d - 1))}
              className="w-10 h-10 rounded-[10px] text-[20px]"
              style={{ background: "var(--bg3)", color: "var(--text)" }}
            >
              −
            </button>
            <div className="font-[var(--font-head)] font-extrabold text-[18px]">{durationMinutes} min</div>
            <button
              onClick={() => setDurationMinutes((d) => Math.min(90, d + 1))}
              className="w-10 h-10 rounded-[10px] text-[20px]"
              style={{ background: "var(--bg3)", color: "var(--text)" }}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Formato dos jogos
          </span>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setFormat("todos_contra_todos")}
              className="rounded-xl p-3.5 text-left"
              style={{
                background: "var(--bg2)",
                border: `1.5px solid ${format === "todos_contra_todos" ? "var(--gold)" : "var(--hairline)"}`,
              }}
            >
              <div
                className="font-[var(--font-head)] font-extrabold text-[14px] uppercase tracking-wide"
                style={{ color: format === "todos_contra_todos" ? "var(--gold)" : "var(--text)" }}
              >
                Todos contra todos
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: "var(--muted)" }}>
                Cada time enfrenta todos os outros uma vez.
              </div>
            </button>
            <button
              onClick={() => setFormat("vencedor_fica")}
              className="rounded-xl p-3.5 text-left"
              style={{
                background: "var(--bg2)",
                border: `1.5px solid ${format === "vencedor_fica" ? "var(--gold)" : "var(--hairline)"}`,
              }}
            >
              <div
                className="font-[var(--font-head)] font-extrabold text-[14px] uppercase tracking-wide"
                style={{ color: format === "vencedor_fica" ? "var(--gold)" : "var(--text)" }}
              >
                Vencedor fica
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: "var(--muted)" }}>
                Quem vence continua jogando contra o próximo time da fila; quem perde vai pro final da fila.
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="text-[12px] font-semibold text-center" style={{ color: "var(--red)" }}>
            {error}
          </div>
        )}
      </ScreenBody>
      <BottomCTA>
        <button
          onClick={handleCreate}
          disabled={!date || isPending}
          className="w-full rounded-xl py-4 font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wider disabled:opacity-40 min-h-[44px]"
          style={{ background: "var(--gold)", color: "#141414", boxShadow: "0 8px 24px oklch(0.80 0.16 86 / .25)" }}
        >
          {isPending ? "Criando..." : "Criar Pelada"}
        </button>
      </BottomCTA>
    </>
  );
}
