"use server";

import { createClient } from "@/lib/supabase/server";
import type { Position } from "@/lib/types";

export async function signUpAction(input: {
  email: string;
  name: string;
  position: Position;
  password: string;
}): Promise<{ error?: string }> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.name.trim() || !input.password) {
    return { error: "Preencha todos os campos." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        name: input.name.trim(),
        position: input.position,
      },
    },
  });
  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Esse e-mail já está cadastrado." };
    }
    return { error: error.message };
  }
  return {};
}

export async function signInAction(input: { email: string; password: string }): Promise<{ error?: string }> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) return { error: "Preencha e-mail e senha." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });
  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }
  return {};
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
