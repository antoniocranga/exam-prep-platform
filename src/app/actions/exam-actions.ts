"use server";

import {
  getMockExamVariants,
  getMockExamByIdOrSlug,
  MockExamVariant,
  MockExamStructure,
} from "@/lib/exams/mock-exams";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function fetchMockExamVariantsAction(): Promise<{
  variants: MockExamVariant[];
  error?: string;
}> {
  try {
    const variants = await getMockExamVariants();
    return { variants };
  } catch (err) {
    console.error("Error in fetchMockExamVariantsAction:", err);
    return { variants: [], error: "Eroare la încărcarea variantelor de examen." };
  }
}

export async function fetchMockExamByIdOrSlugAction(
  idOrSlug: string
): Promise<{ exam: MockExamStructure | null; error?: string }> {
  try {
    const exam = await getMockExamByIdOrSlug(idOrSlug);
    return { exam };
  } catch (err) {
    console.error("Error in fetchMockExamByIdOrSlugAction:", err);
    return { exam: null, error: "Eroare la încărcarea structurii examenului." };
  }
}

// Backwards compatibility alias
export async function fetchMockExamBySlugAction(
  slug: string
): Promise<{ exam: MockExamStructure | null; error?: string }> {
  return fetchMockExamByIdOrSlugAction(slug);
}

export interface ExamAttemptPayload {
  examId: string;
  subiectul1Answers: Record<string, number>;
  subiectul2Text: string;
  subiectul3Text: string;
  scoreSubiectul1: number;
  totalScore: number;
  timeSpentSeconds: number;
}

export async function submitMockExamAttemptAction(
  payload: ExamAttemptPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: true };
    }

    const { error: upsertErr } = await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        lesson_id: payload.examId,
        status: "completed",
        score: payload.totalScore,
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id,lesson_id" }
    );

    if (upsertErr) {
      console.warn("Could not upsert user_progress for mock exam:", upsertErr);
    }

    revalidatePath("/dashboard");
    revalidatePath("/simulare");
    return { success: true };
  } catch (err) {
    console.error("Error submitting mock exam attempt:", err);
    return { success: false, error: "Nu s-a putut salva rezultatul în cont." };
  }
}
