import Link from "next/link";
import { IconPlus, IconUsers } from "@/components/icons";

export function AdminActions({ peladaId, hasTeams }: { peladaId: number | null; hasTeams: boolean }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <Link
        href="/admin/nova-pelada"
        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[12px] uppercase tracking-wide min-h-[44px]"
        style={{ background: "var(--bg2)", border: "1px solid var(--bgold)", color: "var(--gold)" }}
      >
        <IconPlus size={16} />
        Nova Pelada
      </Link>
      {peladaId && hasTeams && (
        <Link
          href={`/admin/sorteio?pelada=${peladaId}`}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[12px] uppercase tracking-wide min-h-[44px]"
          style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
        >
          <IconUsers size={16} />
          Configurar Times
        </Link>
      )}
      <Link
        href="/admin/vincular"
        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-[var(--font-head)] font-extrabold text-[12px] uppercase tracking-wide min-h-[44px]"
        style={{ background: "var(--bg2)", border: "1px solid var(--hairline)", color: "var(--text)" }}
      >
        Vincular Contas
      </Link>
    </div>
  );
}
