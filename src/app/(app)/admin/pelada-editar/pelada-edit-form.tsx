"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ScreenBody, BottomCTA } from "@/components/Screen";
import type { Database } from "@/lib/database.types";
import { updatePeladaDate, updatePeladaDuration, updatePeladaFormat, deletePelada } from "@/lib/actions";

type PeladaFormat = Database["public"]["Enums"]["pelada_format"];

const DURATION_PRESETS = [2, 7, 10];

export function PeladaEditForm({
  pelada,
  hasFinishedGames,
}: {
  pelada: { id: number; date: string; duration_minutes: number; format: PeladaFormat };
  hasFinishedGames: boolean;
}) {
  const router = useRouter();
  const [date, setDate] = useState(pelada.date);
  const [durationMinutes, setDurationMinutes] = useState(pelada.duration_minutes);
  const [format, setFormat] = useState<PeladaFormat>(pelada.format);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDateChange(value: string) {
    setDate(value);
    startTransition(async () => {
      const result = await updatePeladaDate(pelada.id, value);
      if (result.error) setError(result.error);
    });
  }

  function handleDurationChange(minutes: number) {
    if (minutes < 1 || minutes > 90) return;
    setDurationMinutes(minutes);
    startTransition(async () => {
      const result = await updatePeladaDuration(pelada.id, minutes);
      if (result.error) setError(result.error);
    });
  }

  function handleFormatChange(value: PeladaFormat) {
    if (hasFinishedGames || value === format) return;
    setError(null);
    setFormat(value);
    startTransition(async () => {
      const result = await updatePeladaFormat(pelada.id, value);
      if (result.error) {
        setError(result.error);
        setFormat(pelada.format);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deletePelada(pelada.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/jogos");
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
            onChange={(e) => handleDateChange(e.target.value)}
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
                onClick={() => handleDurationChange(min)}
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
              onClick={() => handleDurationChange(Math.max(1, durationMinutes - 1))}
              className="w-10 h-10 rounded-[10px] text-[20px]"
              style={{ background: "var(--bg3)", color: "var(--text)" }}
            >
              −
            </button>
            <div className="font-[var(--font-head)] font-extrabold text-[18px]">{durationMinutes} min</div>
            <button
              onClick={() => handleDurationChange(Math.min(90, durationMinutes + 1))}
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
          {hasFinishedGames && (
            <div className="text-[12px]" style={{ color: "var(--muted2)" }}>
              Já existe jogo finalizado nesta pelada — o formato não pode mais ser alterado.
            </div>
          )}
          <button
            onClick={() => handleFormatChange("todos_contra_todos")}
            disabled={hasFinishedGames || isPending}
            className="rounded-xl p-3.5 text-left disabled:opacity-50"
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
            onClick={() => handleFormatChange("vencedor_fica")}
            disabled={hasFinishedGames || isPending}
            className="rounded-xl p-3.5 text-left disabled:opacity-50"
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
          {!hasFinishedGames && (
            <div className="text-[11px]" style={{ color: "var(--muted2)" }}>
              Mudar o formato apaga os jogos agendados/ao vivo e gera novos jogos conforme o formato escolhido.
            </div>
          )}
        </div>

        {error && (
          <div className="text-[12px] font-semibold text-center" style={{ color: "var(--red)" }}>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 mt-2">
          {confirmingDelete ? (
            <div className="rounded-xl p-3.5 flex flex-col gap-3" style={{ background: "var(--bg2)", border: "1px solid var(--red)" }}>
              <div className="text-[12px] text-center" style={{ color: "var(--muted)" }}>
                Excluir esta pelada e todos os times, jogos e eventos vinculados? Essa ação não pode ser desfeita.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingDelete(false)}
                  disabled={isPending}
                  className="flex-1 rounded-lg py-2.5 font-[var(--font-head)] font-extrabold text-[11px] uppercase tracking-wide disabled:opacity-60"
                  style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--hairline)" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex-1 rounded-lg py-2.5 font-[var(--font-head)] font-extrabold text-[11px] uppercase tracking-wide disabled:opacity-60"
                  style={{ background: "var(--red)", color: "#1a0a0a" }}
                >
                  {isPending ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[12px] uppercase tracking-wide"
              style={{ background: "transparent", color: "var(--red)", border: "1px solid var(--red)" }}
            >
              Excluir pelada
            </button>
          )}
        </div>
      </ScreenBody>
      <BottomCTA>
        <button
          onClick={() => router.push("/jogos")}
          className="w-full rounded-xl py-4 font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wider min-h-[44px]"
          style={{ background: "var(--gold)", color: "#141414" }}
        >
          Concluído
        </button>
      </BottomCTA>
    </>
  );
}
