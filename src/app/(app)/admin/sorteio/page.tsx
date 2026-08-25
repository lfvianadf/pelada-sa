import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { ScreenContent } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
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
      <ScreenContent>
        <TopBar title="Times Sorteados" />
        <div className="flex-1 flex items-center justify-center px-5 text-center text-[13px]" style={{ color: "var(--muted)" }}>
          Nenhuma pelada encontrada. Crie uma pelada e sorteie os times primeiro.
        </div>
      </ScreenContent>
    );
  }

  const { data: teams } = await supabase.from("teams").select("*").eq("pelada_id", peladaId).order("id");
  const teamIds = (teams ?? []).map((t) => t.id);
  const [{ data: teamPlayers }, { data: players }, { data: existingGames }] = await Promise.all([
    teamIds.length > 0 ? supabase.from("team_players").select("*").in("team_id", teamIds) : Promise.resolve({ data: [] }),
    supabase.from("players").select("*"),
    supabase.from("games").select("id").eq("pelada_id", peladaId).limit(1),
  ]);

  return (
    <ScreenContent>
      <TopBar title="Times Sorteados" />
      <SorteioBoard
        peladaId={peladaId}
        teams={teams ?? []}
        teamPlayers={teamPlayers ?? []}
        players={players ?? []}
        hasGames={(existingGames ?? []).length > 0}
      />
    </ScreenContent>
  );
}
