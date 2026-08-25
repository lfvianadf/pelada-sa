"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signInAction } from "@/lib/auth-actions";
import { Screen } from "@/components/Screen";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLogin() {
    setError(null);
    startTransition(async () => {
      const result = await signInAction({ email, password });
      if (result.error) {
        setError(result.error);
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
            Pastoral do Esporte
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
              Senha
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
            onClick={handleLogin}
            disabled={isPending}
            className="mt-1.5 rounded-[10px] py-4 font-[var(--font-head)] font-extrabold text-[15px] uppercase tracking-wider min-h-[44px] disabled:opacity-50"
            style={{ background: "var(--gold)", color: "#141414" }}
          >
            {isPending ? "Entrando..." : "Entrar"}
          </button>

          <Link href="/cadastro" className="text-center text-[12px] font-semibold" style={{ color: "var(--muted)" }}>
            Criar conta
          </Link>
        </div>

        <div className="text-center text-[11px] font-medium" style={{ color: "var(--muted2)" }}>
          Pelada de sábado às 16h · Campo da Paróquia
        </div>
      </div>
    </Screen>
  );
}
