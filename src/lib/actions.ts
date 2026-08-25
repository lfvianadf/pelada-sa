"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/auth";
import { aiSuggestedStars, HUES } from "@/lib/domain";
import type { Position } from "@/lib/types";

type ActionResult = { error?: string };

async function requireAdmin() {
  const player = await getCurrentPlayer();
  if (!player) return { error: "Você precisa estar logado." } as const;
  if (!player.is_admin) return { error: "Apenas administradores podem fazer isso." } as const;
  return { player } as const;
}

export async function createPelada(
  date: string,
  numTeams: number,
  durationMinutes: number,
): Promise<ActionResult & { peladaId?: number }> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("peladas")
    .insert({ date, num_teams: numTeams, duration_minutes: durationMinutes })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/nova-pelada");
  return { peladaId: data.id };
}

export async function updatePeladaDuration(peladaId: number, durationMinutes: number): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  if (durationMinutes < 1 || durationMinutes > 90) return { error: "Duração inválida." };
  const supabase = await createClient();
  const { error } = await supabase.from("peladas").update({ duration_minutes: durationMinutes }).eq("id", peladaId);
  if (error) return { error: error.message };
  revalidatePath("/admin/nova-pelada");
  return {};
}

export async function createGuestPlayer(
  peladaId: number,
  name: string,
  position: Position,
): Promise<ActionResult & { playerId?: number }> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  if (!name.trim()) return { error: "Informe o nome do jogador." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .insert({ name: name.trim(), position, stars: 3 })
    .select("id")
    .single();
  if (error) return { error: error.message };

  const { error: presenceErr } = await supabase
    .from("pelada_presence")
    .upsert({ pelada_id: peladaId, player_id: data.id });
  if (presenceErr) return { error: presenceErr.message };

  revalidatePath("/admin/nova-pelada");
  return { playerId: data.id };
}

export async function mergePlayerAccount(
  targetPlayerId: number,
  duplicatePlayerId: number,
): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  if (targetPlayerId === duplicatePlayerId) return { error: "Selecione jogadores diferentes." };
  const supabase = await createClient();

  const { data: duplicate, error: dupErr } = await supabase
    .from("players")
    .select("user_id")
    .eq("id", duplicatePlayerId)
    .single();
  if (dupErr || !duplicate) return { error: dupErr?.message ?? "Jogador não encontrado." };
  if (!duplicate.user_id) return { error: "Esse jogador não tem conta vinculada." };

  const { data: target, error: targetErr } = await supabase
    .from("players")
    .select("user_id")
    .eq("id", targetPlayerId)
    .single();
  if (targetErr || !target) return { error: targetErr?.message ?? "Jogador não encontrado." };
  if (target.user_id) return { error: "O jogador de destino já tem conta vinculada." };

  const { error: delErr } = await supabase.from("players").delete().eq("id", duplicatePlayerId);
  if (delErr) return { error: delErr.message };

  const { error: updErr } = await supabase
    .from("players")
    .update({ user_id: duplicate.user_id })
    .eq("id", targetPlayerId);
  if (updErr) return { error: updErr.message };

  revalidatePath("/admin/vincular");
  return {};
}

export async function setPresence(peladaId: number, playerId: number, present: boolean): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  const supabase = await createClient();
  if (present) {
    const { error } = await supabase.from("pelada_presence").upsert({ pelada_id: peladaId, player_id: playerId });
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("pelada_presence")
      .delete()
      .eq("pelada_id", peladaId)
      .eq("player_id", playerId);
    if (error) return { error: error.message };
  }
  revalidatePath("/admin/nova-pelada");
  return {};
}

export async function updatePeladaNumTeams(peladaId: number, numTeams: number): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  const supabase = await createClient();
  const { error } = await supabase.from("peladas").update({ num_teams: numTeams }).eq("id", peladaId);
  if (error) return { error: error.message };
  revalidatePath("/admin/nova-pelada");
  return {};
}

export async function sortear(peladaId: number): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  const supabase = await createClient();

  const { data: pelada, error: peladaErr } = await supabase
    .from("peladas")
    .select("num_teams")
    .eq("id", peladaId)
    .single();
  if (peladaErr || !pelada) return { error: peladaErr?.message ?? "Pelada não encontrada." };

  const { data: presence, error: presenceErr } = await supabase
    .from("pelada_presence")
    .select("player_id")
    .eq("pelada_id", peladaId);
  if (presenceErr) return { error: presenceErr.message };

  const presentIds = (presence ?? []).map((p) => p.player_id);
  if (presentIds.length === 0) return { error: "Nenhum jogador presente." };

  const { data: players, error: playersErr } = await supabase
    .from("players")
    .select("id, stars")
    .in("id", presentIds);
  if (playersErr) return { error: playersErr.message };

  const numTeams = pelada.num_teams;
  const pool = [...(players ?? [])].sort((a, b) => b.stars - a.stars);

  // Clear existing teams/games for this pelada (fresh draw).
  const { data: existingTeams } = await supabase.from("teams").select("id").eq("pelada_id", peladaId);
  const existingTeamIds = (existingTeams ?? []).map((t) => t.id);
  if (existingTeamIds.length > 0) {
    await supabase.from("games").delete().eq("pelada_id", peladaId);
    await supabase.from("team_players").delete().in("team_id", existingTeamIds);
    await supabase.from("teams").delete().eq("pelada_id", peladaId);
  }

  const teamRows = Array.from({ length: numTeams }, (_, i) => ({
    pelada_id: peladaId,
    name: `Time ${i + 1}`,
    hue: HUES[i % HUES.length],
  }));
  const { data: newTeams, error: teamsErr } = await supabase.from("teams").insert(teamRows).select("id");
  if (teamsErr || !newTeams) return { error: teamsErr?.message ?? "Falha ao criar times." };

  const teamPlayerRows: { team_id: number; player_id: number }[] = [];
  let dir = 1;
  let idx = 0;
  pool.forEach((p) => {
    teamPlayerRows.push({ team_id: newTeams[idx].id, player_id: p.id });
    idx += dir;
    if (idx === numTeams) {
      idx = numTeams - 1;
      dir = -1;
    } else if (idx === -1) {
      idx = 0;
      dir = 1;
    }
  });

  const { error: tpErr } = await supabase.from("team_players").insert(teamPlayerRows);
  if (tpErr) return { error: tpErr.message };

  revalidatePath("/admin/sorteio");
  revalidatePath("/admin/nova-pelada");
  return {};
}

export async function renameTeam(teamId: number, name: string): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  const supabase = await createClient();
  const { error } = await supabase.from("teams").update({ name }).eq("id", teamId);
  if (error) return { error: error.message };
  revalidatePath("/admin/sorteio");
  return {};
}

export async function movePlayer(fromTeamId: number, toTeamId: number, playerId: number): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  if (fromTeamId === toTeamId) return {};
  const supabase = await createClient();
  const { error: delErr } = await supabase
    .from("team_players")
    .delete()
    .eq("team_id", fromTeamId)
    .eq("player_id", playerId);
  if (delErr) return { error: delErr.message };
  const { error: insErr } = await supabase.from("team_players").insert({ team_id: toTeamId, player_id: playerId });
  if (insErr) return { error: insErr.message };
  revalidatePath("/admin/sorteio");
  return {};
}

export async function swapPlayers(
  teamAId: number,
  playerAId: number,
  teamBId: number,
  playerBId: number,
): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  if (teamAId === teamBId) return { error: "Os times devem ser diferentes." };
  const supabase = await createClient();

  const { error: delAErr } = await supabase
    .from("team_players")
    .delete()
    .eq("team_id", teamAId)
    .eq("player_id", playerAId);
  if (delAErr) return { error: delAErr.message };

  const { error: delBErr } = await supabase
    .from("team_players")
    .delete()
    .eq("team_id", teamBId)
    .eq("player_id", playerBId);
  if (delBErr) return { error: delBErr.message };

  const { error: insErr } = await supabase
    .from("team_players")
    .insert([
      { team_id: teamBId, player_id: playerAId },
      { team_id: teamAId, player_id: playerBId },
    ]);
  if (insErr) return { error: insErr.message };

  revalidatePath("/admin/sorteio");
  return {};
}

export async function confirmTeams(peladaId: number): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  const supabase = await createClient();

  const { data: teams, error: teamsErr } = await supabase.from("teams").select("id").eq("pelada_id", peladaId);
  if (teamsErr) return { error: teamsErr.message };
  if (!teams || teams.length < 2) return { error: "É preciso pelo menos 2 times." };

  await supabase.from("games").delete().eq("pelada_id", peladaId);

  const gameRows: { pelada_id: number; team_a_id: number; team_b_id: number }[] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      gameRows.push({ pelada_id: peladaId, team_a_id: teams[i].id, team_b_id: teams[j].id });
    }
  }
  const { error } = await supabase.from("games").insert(gameRows);
  if (error) return { error: error.message };

  revalidatePath("/jogos");
  revalidatePath("/admin/sorteio");
  return {};
}

export async function startLive(gameId: number): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  const supabase = await createClient();
  const { error } = await supabase
    .from("games")
    .update({ status: "ao vivo", started_at: new Date().toISOString() })
    .eq("id", gameId);
  if (error) return { error: error.message };
  revalidatePath("/ao-vivo");
  revalidatePath("/jogos");
  return {};
}

export async function recordEvent(
  gameId: number,
  playerId: number,
  type: "gol" | "assistencia",
  sec: number,
): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  const supabase = await createClient();
  const { error } = await supabase.from("match_events").insert({ game_id: gameId, player_id: playerId, type, sec });
  if (error) return { error: error.message };
  revalidatePath("/ao-vivo");
  return {};
}

export async function endLive(gameId: number): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  const supabase = await createClient();

  const { data: game, error: gameErr } = await supabase
    .from("games")
    .select("id, team_a_id, team_b_id")
    .eq("id", gameId)
    .single();
  if (gameErr || !game) return { error: gameErr?.message ?? "Jogo não encontrado." };

  const { data: events, error: eventsErr } = await supabase
    .from("match_events")
    .select("player_id, type")
    .eq("game_id", gameId);
  if (eventsErr) return { error: eventsErr.message };

  const { data: teamAPlayers } = await supabase.from("team_players").select("player_id").eq("team_id", game.team_a_id);
  const { data: teamBPlayers } = await supabase.from("team_players").select("player_id").eq("team_id", game.team_b_id);
  const aIds = new Set((teamAPlayers ?? []).map((p) => p.player_id));
  const bIds = new Set((teamBPlayers ?? []).map((p) => p.player_id));

  const scoreA = (events ?? []).filter((e) => e.type === "gol" && aIds.has(e.player_id)).length;
  const scoreB = (events ?? []).filter((e) => e.type === "gol" && bIds.has(e.player_id)).length;

  const { error: updGameErr } = await supabase
    .from("games")
    .update({ status: "finalizado", score_a: scoreA, score_b: scoreB })
    .eq("id", gameId);
  if (updGameErr) return { error: updGameErr.message };

  const winnerIds = scoreA > scoreB ? aIds : scoreB > scoreA ? bIds : new Set<number>();
  const allPlayerIds = new Set<number>([...aIds, ...bIds]);

  for (const playerId of allPlayerIds) {
    const goals = (events ?? []).filter((e) => e.player_id === playerId && e.type === "gol").length;
    const assists = (events ?? []).filter((e) => e.player_id === playerId && e.type === "assistencia").length;
    const won = winnerIds.has(playerId);

    const { data: player } = await supabase
      .from("players")
      .select("goals, assists, games, wins")
      .eq("id", playerId)
      .single();
    if (!player) continue;

    await supabase
      .from("players")
      .update({
        goals: player.goals + goals,
        assists: player.assists + assists,
        games: player.games + 1,
        wins: player.wins + (won ? 1 : 0),
      })
      .eq("id", playerId);
  }

  revalidatePath("/ao-vivo");
  revalidatePath("/jogos");
  revalidatePath("/dashboard");
  revalidatePath("/perfil");
  return {};
}

export async function approveStarSuggestion(playerId: number, suggestionId: number | null): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select("goals, assists, games, wins")
    .eq("id", playerId)
    .single();
  if (!player) return { error: "Jogador não encontrado." };

  const suggested = aiSuggestedStars(player);
  const { error } = await supabase.from("players").update({ stars: suggested, star_origin: "ia" }).eq("id", playerId);
  if (error) return { error: error.message };

  if (suggestionId) {
    await supabase.from("star_suggestions").update({ status: "aprovada" }).eq("id", suggestionId);
  } else {
    await supabase.from("star_suggestions").insert({ player_id: playerId, suggested, status: "aprovada" });
  }

  revalidatePath("/admin/estrelas");
  revalidatePath("/perfil");
  return {};
}

export async function ignoreStarSuggestion(playerId: number, suggestionId: number | null): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  const supabase = await createClient();

  if (suggestionId) {
    const { error } = await supabase.from("star_suggestions").update({ status: "ignorada" }).eq("id", suggestionId);
    if (error) return { error: error.message };
  } else {
    const { data: player } = await supabase
      .from("players")
      .select("goals, assists, games, wins")
      .eq("id", playerId)
      .single();
    const suggested = player ? aiSuggestedStars(player) : 3;
    const { error } = await supabase
      .from("star_suggestions")
      .insert({ player_id: playerId, suggested, status: "ignorada" });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/estrelas");
  return {};
}

export async function adjustStars(playerId: number, suggestionId: number | null, value: number): Promise<ActionResult> {
  const check = await requireAdmin();
  if ("error" in check) return check;
  if (value < 1 || value > 5) return { error: "Valor inválido." };
  const supabase = await createClient();

  const { error } = await supabase.from("players").update({ stars: value, star_origin: "manual" }).eq("id", playerId);
  if (error) return { error: error.message };

  if (suggestionId) {
    await supabase.from("star_suggestions").update({ status: "ajustada" }).eq("id", suggestionId);
  } else {
    await supabase.from("star_suggestions").insert({ player_id: playerId, suggested: value, status: "ajustada" });
  }

  revalidatePath("/admin/estrelas");
  revalidatePath("/perfil");
  return {};
}
