import { redirect } from "next/navigation";
import { getCurrentPlayer } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");

  return (
    <div className="flex flex-col min-h-dvh max-w-[480px] mx-auto w-full" style={{ background: "var(--bg)" }}>
      <div className="flex-1 flex flex-col">{children}</div>
      <NavBar isAdmin={me.is_admin} />
    </div>
  );
}
