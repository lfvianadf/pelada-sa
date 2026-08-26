import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { ScreenContent } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { PeladaEditForm } from "./pelada-edit-form";

export default async function PeladaEditarPage({
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
        <TopBar title="Editar Pelada" />
        <div className="flex-1 flex items-center justify-center px-5 text-center text-[13px]" style={{ color: "var(--muted)" }}>
          Nenhuma pelada encontrada.
        </div>
      </ScreenContent>
    );
  }

  const { data: peladaRow, error } = await supabase
    .from("peladas")
    .select("id, date, duration_minutes, format, finished")
    .eq("id", peladaId)
    .single();

  if (error || !peladaRow) {
    return (
      <ScreenContent>
        <TopBar title="Editar Pelada" />
        <div className="flex-1 flex items-center justify-center px-5 text-center text-[13px]" style={{ color: "var(--muted)" }}>
          Pelada não encontrada.
        </div>
      </ScreenContent>
    );
  }

  const { data: finishedGames } = await supabase
    .from("games")
    .select("id")
    .eq("pelada_id", peladaId)
    .eq("status", "finalizado")
    .limit(1);
  const hasFinishedGames = (finishedGames ?? []).length > 0;

  return (
    <ScreenContent>
      <TopBar title="Editar Pelada" />
      <PeladaEditForm pelada={peladaRow} hasFinishedGames={hasFinishedGames} />
    </ScreenContent>
  );
}
