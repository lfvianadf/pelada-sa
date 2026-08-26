"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ScreenBody } from "@/components/Screen";
import { Stars } from "@/components/Stars";
import { Avatar } from "@/components/Avatar";
import type { PlayerRow } from "@/lib/domain";
import { mergePlayerAccount } from "@/lib/actions";

type Step = "pickDuplicate" | "pickTarget";

export function VincularForm({
  withAccount,
  withoutAccount,
}: {
  withAccount: PlayerRow[];
  withoutAccount: PlayerRow[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("pickDuplicate");
  const [duplicateId, setDuplicateId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mergedIds, setMergedIds] = useState<Set<number>>(new Set());

  const visibleWithAccount = withAccount.filter((p) => !mergedIds.has(p.id));
  const visibleWithoutAccount = withoutAccount.filter((p) => !mergedIds.has(p.id));

  const duplicate = visibleWithAccount.find((p) => p.id === duplicateId) ?? null;

  function handlePickDuplicate(id: number) {
    setDuplicateId(id);
    setStep("pickTarget");
  }

  function handleConfirmMerge(targetId: number) {
    if (!duplicateId) return;
    setError(null);
    startTransition(async () => {
      const result = await mergePlayerAccount(targetId, duplicateId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMergedIds((prev) => new Set(prev).add(duplicateId).add(targetId));
      setDuplicateId(null);
      setStep("pickDuplicate");
      router.refresh();
    });
  }

  return (
    <ScreenBody className="gap-5">
      <div className="text-[13px]" style={{ color: "var(--muted)" }}>
        Quando um jogador cria conta e já existe um registro pré-cadastrado dele na base (com estrelas/histórico), use isto
        para fundir os dois — a conta nova assume o registro pré-cadastrado.
      </div>

      {step === "pickDuplicate" && (
        <div className="flex flex-col gap-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            1. Escolha a conta recém-criada (duplicada)
          </div>
          {visibleWithAccount.length === 0 && (
            <div className="text-center text-[13px] py-4" style={{ color: "var(--muted2)" }}>
              Nenhuma conta com registro próprio ainda.
            </div>
          )}
          {visibleWithAccount.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePickDuplicate(p.id)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left min-h-[44px]"
              style={{ background: "var(--bg2)", border: "1px solid var(--hairline)" }}
            >
              <Avatar size={32} />
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="text-[14px] font-bold">{p.name}</div>
                <div className="text-[10px] font-semibold" style={{ color: "var(--muted)" }}>{p.position}</div>
              </div>
              <Stars value={p.stars} size={12} />
            </button>
          ))}
        </div>
      )}

      {step === "pickTarget" && duplicate && (
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => setStep("pickDuplicate")}
            className="text-[12px] font-bold self-start"
            style={{ color: "var(--muted)" }}
          >
            ‹ Voltar
          </button>
          <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            2. Qual jogador pré-cadastrado é <span style={{ color: "var(--gold)" }}>{duplicate.name}</span>?
          </div>
          {visibleWithoutAccount.length === 0 && (
            <div className="text-center text-[13px] py-4" style={{ color: "var(--muted2)" }}>
              Nenhum jogador pré-cadastrado sem conta.
            </div>
          )}
          {visibleWithoutAccount.map((p) => (
            <button
              key={p.id}
              onClick={() => handleConfirmMerge(p.id)}
              disabled={isPending}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left min-h-[44px] disabled:opacity-60"
              style={{ background: "var(--bg2)", border: "1px solid var(--bgold)" }}
            >
              <Avatar size={32} />
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="text-[14px] font-bold">{p.name}</div>
                <div className="text-[10px] font-semibold" style={{ color: "var(--muted)" }}>{p.position}</div>
              </div>
              <Stars value={p.stars} size={12} />
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="text-[12px] font-semibold text-center" style={{ color: "var(--red)" }}>
          {error}
        </div>
      )}
    </ScreenBody>
  );
}
