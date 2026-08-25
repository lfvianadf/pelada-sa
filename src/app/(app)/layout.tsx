import { redirect } from "next/navigation";
import { getCurrentPlayer } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");

  return (
    <div className="flex flex-col h-dvh min-h-0 max-w-[480px] mx-auto w-full overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>
      <NavBar isAdmin={me.is_admin} />
    </div>
  );
}
