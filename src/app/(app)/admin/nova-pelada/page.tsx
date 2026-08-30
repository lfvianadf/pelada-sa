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

  const { data: latestPelada } = await supabase
    .from("peladas")
    .select("id")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestPelada) {
    const { count } = await supabase
      .from("teams")
      .select("id", { count: "exact", head: true })
      .eq("pelada_id", latestPelada.id);
    if (!count) redirect(`/admin/gerenciar-presenca?pelada=${latestPelada.id}`);
  }

  return (
    <ScreenContent>
      <TopBar title="Nova Pelada" />
      <NovaPeladaForm initialDate={new Date().toISOString().slice(0, 10)} />
    </ScreenContent>
  );
}
