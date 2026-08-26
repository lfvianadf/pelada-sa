"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ScreenBody, BottomCTA } from "@/components/Screen";
import type { Position } from "@/lib/types";
import type { PlayerRow } from "@/lib/domain";
import { updateMyProfile } from "@/lib/actions";

const POSITIONS: Position[] = ["Qualquer", "Goleiro", "Zagueiro", "Meio-campo", "Atacante"];

export function EditProfileForm({ player }: { player: PlayerRow }) {
  const router = useRouter();
  const [name, setName] = useState(player.name);
  const [position, setPosition] = useState<Position>(player.position);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateMyProfile(name, position);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/perfil");
    });
  }

  return (
    <>
      <ScreenBody className="pb-3">
        <div className="flex flex-col items-center gap-2.5">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{ background: "var(--bg2)", border: "3px dashed var(--muted2)", color: "var(--muted2)" }}
          >
            FOTO
          </div>
          <div className="text-[11px] font-semibold" style={{ color: "var(--muted2)" }}>
            Upload de foto em breve
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Nome
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            className="rounded-[10px] px-3.5 py-3 text-[15px] outline-none"
            style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Posição preferida
          </span>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as Position)}
            className="rounded-[10px] px-3.5 py-3 text-[15px] outline-none"
            style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p === "Qualquer" ? "Qualquer posição" : p}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <div className="text-[12px] font-semibold text-center" style={{ color: "var(--red)" }}>
            {error}
          </div>
        )}
      </ScreenBody>
      <BottomCTA>
        <div className="flex gap-2.5">
          <button
            onClick={() => router.push("/perfil")}
            disabled={isPending}
            className="rounded-xl px-5 py-4 font-[var(--font-head)] font-extrabold text-[14px] uppercase tracking-wide min-h-[44px] disabled:opacity-60"
            style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            className="flex-1 rounded-xl py-4 font-[var(--font-head)] font-extrabold text-[16px] uppercase tracking-wider disabled:opacity-40 min-h-[44px]"
            style={{ background: "var(--gold)", color: "#141414", boxShadow: "0 8px 24px oklch(0.80 0.16 86 / .25)" }}
          >
            {isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </BottomCTA>
    </>
  );
}
