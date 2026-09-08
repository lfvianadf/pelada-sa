"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconPlus, IconUsers, IconLink, IconEdit } from "@/components/icons";
import { finishPelada, reopenPelada } from "@/lib/actions";

export function AdminActions({
  peladaId,
  hasTeams,
  isFinished,
}: {
  peladaId: number | null;
  hasTeams: boolean;
  isFinished: boolean;
}) {
  const router = useRouter();
  const [confirmingFinish, setConfirmingFinish] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFinish() {
    if (!peladaId) return;
    setError(null);
    startTransition(async () => {
      const result = await finishPelada(peladaId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirmingFinish(false);
      router.refresh();
    });
  }

  function handleReopen() {
    if (!peladaId) return;
    setError(null);
    startTransition(async () => {
      const result = await reopenPelada(peladaId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2.5">
        <Link
          href="/admin/nova-pelada"
          title="Nova Pelada"
          aria-label="Nova Pelada"
          className="w-11 h-11 flex items-center justify-center rounded-xl shrink-0"
          style={{ background: "var(--bg2)", border: "1px solid var(--bgold)", color: "var(--gold)" }}
        >
          <IconPlus size={18} />
        </Link>
        {peladaId && (
          <Link
            href={`/admin/pelada-editar?pelada=${peladaId}`}
            title="Editar Pelada"
            aria-label="Editar Pelada"
            className="w-11 h-11 flex items-center justify-center rounded-xl shrink-0"
            style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
          >
            <IconEdit size={18} />
          </Link>
        )}
        {peladaId && hasTeams && !isFinished && (
          <Link
            href={`/admin/sorteio?pelada=${peladaId}`}
            title="Configurar Times"
            aria-label="Configurar Times"
            className="w-11 h-11 flex items-center justify-center rounded-xl shrink-0"
            style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
          >
            <IconUsers size={18} />
          </Link>
        )}
        <Link
          href="/admin/vincular"
          title="Vincular Contas"
          aria-label="Vincular Contas"
          className="w-11 h-11 flex items-center justify-center rounded-xl shrink-0"
          style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
        >
          <IconLink size={18} />
        </Link>

        {peladaId && isFinished && (
          <button
            onClick={handleReopen}
            disabled={isPending}
            className="flex-1 rounded-xl font-[var(--font-head)] font-extrabold text-[11px] uppercase tracking-wide disabled:opacity-60"
            style={{ background: "var(--bg2)", color: "var(--text)", border: "1px solid var(--hairline)" }}
          >
            {isPending ? "Reabrindo..." : "Reabrir pelada"}
          </button>
        )}

        {peladaId && !isFinished && !confirmingFinish && (
          <button
            onClick={() => setConfirmingFinish(true)}
            className="flex-1 rounded-xl font-[var(--font-head)] font-extrabold text-[11px] uppercase tracking-wide"
            style={{ background: "transparent", color: "var(--green)", border: "1px solid var(--green)" }}
          >
            Finalizar pelada
          </button>
        )}
      </div>

      {peladaId && !isFinished && confirmingFinish && (
        <div className="rounded-xl p-3.5 flex flex-col gap-3" style={{ background: "var(--bg2)", border: "1px solid var(--green)" }}>
          <div className="text-[12px] text-center" style={{ color: "var(--muted)" }}>
            Encerrar esta pelada? Jogos ainda não realizados serão excluídos e nenhum novo jogo poderá ser iniciado. Você pode reabrir depois se precisar.
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmingFinish(false)}
              disabled={isPending}
              className="flex-1 rounded-lg py-2.5 font-[var(--font-head)] font-extrabold text-[11px] uppercase tracking-wide disabled:opacity-60"
              style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--hairline)" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleFinish}
              disabled={isPending}
              className="flex-1 rounded-lg py-2.5 font-[var(--font-head)] font-extrabold text-[11px] uppercase tracking-wide disabled:opacity-60"
              style={{ background: "var(--green)", color: "#0c1a10" }}
            >
              {isPending ? "Encerrando..." : "Encerrar"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="text-[12px] font-semibold text-center" style={{ color: "var(--red)" }}>
          {error}
        </div>
      )}
    </div>
  );
}
