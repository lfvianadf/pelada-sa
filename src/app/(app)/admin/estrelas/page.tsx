import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { ScreenContent } from "@/components/Screen";
import { EstrelasList } from "./estrelas-list";

export default async function EstrelasPage() {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");
  if (!me.is_admin) redirect("/perfil");

  const supabase = await createClient();
  const { data: players } = await supabase.from("players").select("*").order("name");
  const { data: suggestions } = await supabase
    .from("star_suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <ScreenContent>
      <EstrelasList players={players ?? []} suggestions={suggestions ?? []} />
    </ScreenContent>
  );
}
