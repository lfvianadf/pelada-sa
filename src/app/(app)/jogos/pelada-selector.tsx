"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconTrash } from "@/components/icons";
import { deletePelada } from "@/lib/actions";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function PeladaSelector({
  peladas,
  selectedId,
  isAdmin,
}: {
  peladas: { id: number; date: string }[];
  selectedId: number | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmingPelada = peladas.find((p) => p.id === confirmingId) ?? null;

  function handleDelete() {
    if (confirmingId === null) return;
    const id = confirmingId;
    setError(null);
    startTransition(async () => {
      const result = await deletePelada(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirmingId(null);
      if (id === selectedId) {
        router.push("/jogos");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex items-end gap-2">
        <label className="flex-1 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Pelada
          </span>
          <select
            value={selectedId ?? ""}
            onChange={(e) => router.push(`/jogos?pelada=${e.target.value}`)}
            className="rounded-[10px] px-3.5 py-3 text-[15px]"
            style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
          >
            {peladas.map((p) => (
              <option key={p.id} value={p.id}>
                {formatDate(p.date)}
              </option>
            ))}
          </select>
        </label>
        {isAdmin && selectedId !== null && (
          <button
            onClick={() => setConfirmingId(selectedId)}
            className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--red)" }}
          >
            <IconTrash size={18} />
          </button>
        )}
      </div>

      {confirmingPelada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,.6)" }}
          onClick={() => !isPending && setConfirmingId(null)}
        >
          <div
            className="w-full max-w-[380px] rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-[var(--font-head)] font-extrabold text-[18px] uppercase tracking-wide text-center">
              Excluir pelada?
            </div>
            <div className="text-[13px] text-center" style={{ color: "var(--muted)" }}>
              A pelada de <strong style={{ color: "var(--text)" }}>{formatDate(confirmingPelada.date)}</strong> e todos os
              times, jogos e eventos vinculados a ela serão apagados. Essa ação não pode ser desfeita.
            </div>
            {error && (
              <div className="text-[12px] font-semibold text-center" style={{ color: "var(--red)" }}>
                {error}
              </div>
            )}
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmingId(null)}
                disabled={isPending}
                className="flex-1 rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide disabled:opacity-60"
                style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--hairline)" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[13px] uppercase tracking-wide disabled:opacity-60"
                style={{ background: "var(--red)", color: "#1a0a0a" }}
              >
                {isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
