import { supabase } from "../lib/supabase";

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    throw new Error("Supabase の環境変数が設定されていません。");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
