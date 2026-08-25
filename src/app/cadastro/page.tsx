"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUpAction, signInAction } from "@/lib/auth-actions";
import type { Position } from "@/lib/types";
import { Screen } from "@/components/Screen";

const POSITIONS: Position[] = ["Qualquer", "Goleiro", "Zagueiro", "Meio-campo", "Atacante"];

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [position, setPosition] = useState<Position>("Qualquer");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (!email.trim() || !name.trim()) {
      setError("Preencha e-mail e nome.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    startTransition(async () => {
      const result = await signUpAction({ email, name, position, password });
      if (result.error) {
        setError(result.error);
        return;
      }
      const loginResult = await signInAction({ email, password });
      if (loginResult.error) {
        window.location.href = "/login";
        return;
      }
      window.location.href = "/perfil";
    });
  }

  return (
    <Screen>
      <div className="flex-1 flex flex-col justify-center px-6 py-8 gap-6">
        <div className="flex flex-col items-center gap-2.5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-[var(--font-head)] font-extrabold text-[22px] tracking-wide"
            style={{ background: "var(--bg2)", border: "2px solid var(--gold)", color: "var(--gold)" }}
          >
            SA
          </div>
          <div className="font-[var(--font-head)] font-extrabold text-[34px] leading-none uppercase tracking-wide">
            Esporte <span style={{ color: "var(--gold)" }}>SA</span>
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[2px]" style={{ color: "var(--muted)" }}>
            Criar conta
          </div>
        </div>

        <div
          className="rounded-2xl p-5.5 flex flex-col gap-4"
          style={{ background: "var(--bg2)", border: "1px solid var(--bgold)", boxShadow: "0 12px 30px rgba(0,0,0,.5)" }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              E-mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoCapitalize="off"
              autoCorrect="off"
              className="rounded-[10px] px-3.5 py-3 text-[15px] outline-none"
              style={{ background: "var(--bg3)", border: "1px solid var(--hairline)", color: "var(--text)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              Nome completo
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="rounded-[10px] px-3.5 py-3 text-[15px] outline-none"
              style={{ background: "var(--bg3)", border: "1px solid var(--hairline)", color: "var(--text)" }}
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
              style={{ background: "var(--bg3)", border: "1px solid var(--hairline)", color: "var(--text)" }}
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p === "Qualquer" ? "Qualquer posição" : p}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              Senha
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-[10px] px-3.5 py-3 text-[15px] outline-none"
              style={{ background: "var(--bg3)", border: "1px solid var(--hairline)", color: "var(--text)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              Confirmar senha
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="rounded-[10px] px-3.5 py-3 text-[15px] outline-none"
              style={{ background: "var(--bg3)", border: "1px solid var(--hairline)", color: "var(--text)" }}
            />
          </label>

          {error && (
            <div className="text-[12px] font-semibold text-center" style={{ color: "var(--red)" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="mt-1.5 rounded-[10px] py-4 font-[var(--font-head)] font-extrabold text-[15px] uppercase tracking-wider min-h-[44px] disabled:opacity-50"
            style={{ background: "var(--gold)", color: "#141414" }}
          >
            {isPending ? "Criando..." : "Criar conta"}
          </button>

          <Link href="/login" className="text-center text-[12px] font-semibold" style={{ color: "var(--muted)" }}>
            Já tem conta? Entrar
          </Link>
        </div>
      </div>
    </Screen>
  );
}
