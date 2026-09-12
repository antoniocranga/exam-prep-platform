"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string | null;
  success?: string | null;
}

export async function signIn(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectPath = (formData.get("redirect") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Vă rugăm să introduceți adresa de email și parola." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(redirectPath);
}

export async function signUp(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password) {
    return { error: "Vă rugăm să completați toate câmpurile obligatorii." };
  }

  if (password.length < 6) {
    return { error: "Parola trebuie să aibă cel puțin 6 caractere." };
  }

  if (password !== confirmPassword) {
    return { error: "Parolele introduse nu coincid." };
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const proto =
    headersList.get("x-forwarded-proto") ||
    (host?.includes("localhost") ? "http" : "https");
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (host ? `${proto}://${host}` : "https://exam-prep-platform-plum.vercel.app");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  return {
    success:
      "Contul a fost creat cu succes! Dacă este necesară confirmarea prin email, verificați căsuța poștală.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
