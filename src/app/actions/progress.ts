"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ProgressResult {
  success: boolean;
  savedToCloud: boolean;
  error?: string;
}

/**
 * Server action to record a quiz or lesson attempt into user_progress.
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
  return { success: true, savedToCloud: true };
}
