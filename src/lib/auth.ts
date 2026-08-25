import { createClient } from "@/lib/supabase/server";
import type { PlayerRow } from "@/lib/domain";

export async function getCurrentPlayer(): Promise<PlayerRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && (error.status === 403 || error.code === "user_not_found")) {
    await supabase.auth.signOut();
    return null;
  }
  if (!user) return null;

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return player ?? null;
}
