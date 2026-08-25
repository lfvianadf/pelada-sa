import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { Screen } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { NavBar } from "@/components/NavBar";
import { NovaPeladaForm } from "./nova-pelada-form";

export default async function NovaPeladaPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");
  if (!me.is_admin) redirect("/perfil");

  const { new: isNew } = await searchParams;

  const supabase = await createClient();
  const { data: players } = await supabase.from("players").select("*").order("name");

  const latestPeladaQuery = isNew
    ? { data: null }
    : await supabase
        .from("peladas")
        .select("id, date, num_teams, duration_minutes")
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
  const { data: latestPelada } = latestPeladaQuery;

  let presentIds: number[] = [];
  if (latestPelada) {
    const { data: presence } = await supabase
      .from("pelada_presence")
      .select("player_id")
      .eq("pelada_id", latestPelada.id);
    presentIds = (presence ?? []).map((p) => p.player_id);
  }

  return (
    <Screen>
      <TopBar title="Nova Pelada" />
      <NovaPeladaForm
        players={players ?? []}
        initialPeladaId={latestPelada?.id ?? null}
        initialDate={latestPelada?.date ?? new Date().toISOString().slice(0, 10)}
        initialNumTeams={latestPelada?.num_teams ?? 3}
        initialDurationMinutes={latestPelada?.duration_minutes ?? 10}
        initialPresentIds={presentIds}
      />
      <NavBar isAdmin={me.is_admin} />
    </Screen>
  );
}
