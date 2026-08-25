import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { Screen } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { NavBar } from "@/components/NavBar";
import { SorteioBoard } from "./sorteio-board";

export default async function SorteioPage({
  searchParams,
}: {
  searchParams: Promise<{ pelada?: string }>;
}) {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");
  if (!me.is_admin) redirect("/perfil");

  const { pelada } = await searchParams;
  const supabase = await createClient();

  let peladaId = pelada ? Number(pelada) : null;
  if (!peladaId) {
    const { data: latest } = await supabase.from("peladas").select("id").order("date", { ascending: false }).limit(1).maybeSingle();
    peladaId = latest?.id ?? null;
  }

  if (!peladaId) {
    return (
      <Screen>
        <TopBar title="Times Sorteados" />
        <div className="flex-1 flex items-center justify-center px-5 text-center text-[13px]" style={{ color: "var(--muted)" }}>
          Nenhuma pelada encontrada. Crie uma pelada e sorteie os times primeiro.
        </div>
        <NavBar isAdmin={me.is_admin} />
      </Screen>
    );
  }

  const { data: teams } = await supabase.from("teams").select("*").eq("pelada_id", peladaId).order("id");
  const teamIds = (teams ?? []).map((t) => t.id);
  const { data: teamPlayers } =
    teamIds.length > 0 ? await supabase.from("team_players").select("*").in("team_id", teamIds) : { data: [] };
  const { data: players } = await supabase.from("players").select("*");

  return (
    <Screen>
      <TopBar title="Times Sorteados" />
      <SorteioBoard
        peladaId={peladaId}
        teams={teams ?? []}
        teamPlayers={teamPlayers ?? []}
        players={players ?? []}
      />
      <NavBar isAdmin={me.is_admin} />
    </Screen>
  );
}
