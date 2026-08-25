"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutAction } from "@/lib/auth-actions";
import { IconShirt, IconBall, IconWhistle, IconChartBar, IconStarFilled, IconLogout } from "@/components/icons";

const BASE_ITEMS = [
  { href: "/perfil", label: "Perfil", icon: IconShirt },
  { href: "/jogos", label: "Jogos", icon: IconBall },
  { href: "/ao-vivo", label: "Ao Vivo", icon: IconWhistle },
  { href: "/dashboard", label: "Raio-X", icon: IconChartBar },
];

const ADMIN_ITEM = { href: "/admin/estrelas", label: "Estrelas", icon: IconStarFilled };

export function NavBar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = isAdmin ? [...BASE_ITEMS, ADMIN_ITEM] : BASE_ITEMS;

  async function handleLogout() {
    await signOutAction();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav
      className="sticky bottom-0 flex items-center gap-1 px-2 pt-2 backdrop-blur"
      style={{
        borderTop: "1px solid var(--hairline)",
        background: "oklch(0.08 0.006 260 / .92)",
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
      }}
    >
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href === "/jogos" && (pathname === "/admin/nova-pelada" || pathname === "/admin/sorteio"));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl min-h-[44px] transition-colors"
            style={{
              color: active ? "#141414" : "var(--muted)",
              background: active ? "var(--gold)" : "transparent",
            }}
          >
            <Icon size={20} />
            <span className="text-[9px] font-bold uppercase tracking-wide">{item.label}</span>
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl min-h-[44px]"
        style={{ color: "var(--muted)" }}
      >
        <IconLogout size={20} />
        <span className="text-[9px] font-bold uppercase tracking-wide">Sair</span>
      </button>
    </nav>
  );
}
