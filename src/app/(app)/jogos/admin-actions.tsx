import Link from "next/link";
import { IconPlus, IconUsers, IconLink } from "@/components/icons";

export function AdminActions({ peladaId, hasTeams }: { peladaId: number | null; hasTeams: boolean }) {
  return (
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
      {peladaId && hasTeams && (
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
    </div>
  );
}
