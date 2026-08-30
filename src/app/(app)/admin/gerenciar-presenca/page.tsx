import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { ScreenContent } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { GerenciarPresencaClient } from "./gerenciar-presenca-client";

export default async function GerenciarPresencaPage({
  searchParams,
}: {
  searchParams: Promise<{ pelada?: string }>;
}) {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");
  if (!me.is_admin) redirect("/perfil");

  const { pelada } = await searchParams;
  const peladaId = pelada ? Number(pelada) : NaN;
  if (!peladaId || Number.isNaN(peladaId)) redirect("/admin/nova-pelada");

  const supabase = await createClient();

  const [{ data: peladaRow }, { data: players }, { data: presence }] = await Promise.all([
    supabase.from("peladas").select("id, num_teams").eq("id", peladaId).maybeSingle(),
    supabase.from("players").select("*").order("name"),
    supabase.from("pelada_presence").select("player_id").eq("pelada_id", peladaId),
  ]);

  if (!peladaRow) redirect("/admin/nova-pelada");

  const presentIds = (presence ?? []).map((p) => p.player_id);

  return (
    <ScreenContent>
      <TopBar title="Gerenciar Presença" />
      <GerenciarPresencaClient
        peladaId={peladaId}
        players={players ?? []}
        initialPresentIds={presentIds}
        initialNumTeams={peladaRow.num_teams}
      />
    </ScreenContent>
  );
}
