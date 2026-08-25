import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { ScreenContent } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { NovaPeladaForm } from "./nova-pelada-form";

export default async function NovaPeladaPage() {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");
  if (!me.is_admin) redirect("/perfil");

  const supabase = await createClient();
  const { data: players } = await supabase.from("players").select("*").order("name");

  return (
    <ScreenContent>
      <TopBar title="Nova Pelada" />
      <NovaPeladaForm
        players={players ?? []}
        initialDate={new Date().toISOString().slice(0, 10)}
        initialNumTeams={3}
        initialDurationMinutes={10}
      />
    </ScreenContent>
  );
}
