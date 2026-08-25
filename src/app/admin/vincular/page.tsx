import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { Screen } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { NavBar } from "@/components/NavBar";
import { VincularForm } from "./vincular-form";

export default async function VincularPage() {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");
  if (!me.is_admin) redirect("/perfil");

  const supabase = await createClient();
  const { data: players } = await supabase.from("players").select("*").order("name");

  const withAccount = (players ?? []).filter((p) => p.user_id);
  const withoutAccount = (players ?? []).filter((p) => !p.user_id);

  return (
    <Screen>
      <TopBar title="Vincular Contas" />
      <VincularForm withAccount={withAccount} withoutAccount={withoutAccount} />
      <NavBar isAdmin={me.is_admin} />
    </Screen>
  );
}
