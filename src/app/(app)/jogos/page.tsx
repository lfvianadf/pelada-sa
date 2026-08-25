import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { standingsFor } from "@/lib/domain";
import { ScreenContent, ScreenBody } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { JogosList } from "./jogos-list";
import { PeladaSelector } from "./pelada-selector";
import { AdminActions } from "./admin-actions";

export default async function JogosPage({
  searchParams,
}: {
  searchParams: Promise<{ pelada?: string }>;
}) {
  const me = await getCurrentPlayer();
  if (!me) redirect("/login");

  const { pelada } = await searchParams;
  const supabase = await createClient();

  const { data: peladas } = await supabase.from("peladas").select("id, date").order("date", { ascending: false });

  const peladaId = pelada ? Number(pelada) : peladas?.[0]?.id;

  const [{ data: games }, { data: teams }] = peladaId
    ? await Promise.all([
        supabase.from("games").select("*").eq("pelada_id", peladaId).order("id"),
        supabase.from("teams").select("*").eq("pelada_id", peladaId),
      ])
    : [{ data: [] }, { data: [] }];

  const standings = standingsFor(games ?? [], teams ?? []);
  const hasTeams = (teams ?? []).length > 0;

  return (
    <ScreenContent>
      <TopBar title="Jogos do Dia" />
      <ScreenBody>
        {(peladas ?? []).length > 0 && (
          <PeladaSelector peladas={peladas ?? []} selectedId={peladaId ?? null} isAdmin={me.is_admin} />
        )}

        {me.is_admin && <AdminActions peladaId={peladaId ?? null} hasTeams={hasTeams} />}

        {!peladaId && (
          <div className="text-center text-[13px] py-6" style={{ color: "var(--muted2)" }}>
            {me.is_admin ? "Crie uma pelada para começar." : "Nenhuma pelada cadastrada ainda."}
          </div>
        )}

        {peladaId && (
          <JogosList games={games ?? []} teams={teams ?? []} standings={standings} isAdmin={me.is_admin} />
        )}
      </ScreenBody>
    </ScreenContent>
  );
}
