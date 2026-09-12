"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ProgressResult {
  success: boolean;
  savedToCloud: boolean;
  error?: string;
  status?: string;
  score?: number | null;
}

/**
 * Server action to record a quiz or exercise attempt into user_progress.
 * Scoped to authenticated user; if unauthenticated, gracefully returns savedToCloud: false.
 */
export async function recordProgress(
  lessonId: string,
  score: number | null,
  status: "completed" | "in_progress" = "completed"
): Promise<ProgressResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: true, savedToCloud: false };
  }

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status: status,
      score: score,
      last_accessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    return { success: false, savedToCloud: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/modules");
  return { success: true, savedToCloud: true, status, score };
}

/**
 * Toggle or set explicit lesson completion status (e.g. from lesson header button).
 */
export async function toggleLessonComplete(
  lessonId: string,
  nextStatus: "completed" | "in_progress"
): Promise<ProgressResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, savedToCloud: false, error: "Trebuie să fii autentificat pentru a salva progresul." };
  }

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status: nextStatus,
      last_accessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    return { success: false, savedToCloud: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/modules");
  return { success: true, savedToCloud: true, status: nextStatus };
}

/**
 * Fetch progress for a specific lesson and current user.
 */
export async function getUserLessonProgress(lessonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_progress")
    .select("status, score, last_accessed_at")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as { status: string; score: number | null; last_accessed_at: string };
}
