import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ModuleRow, LessonRow, LessonBlockRow, UserProgressRow, BlockType } from "@/types/database.types";
import { PracticeClient, PracticeItem } from "@/components/practice/practice-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Practică & Testare Activă — ExamPrep România",
  description:
    "Exersează teste grilă oficiale, seturi de flashcards și grile interactive conforme curriculei pentru Titularizare și Definitivat.",
};

export default async function PracticePage() {
  const supabase = await createClient();

  // 1. Fetch authenticated user (if any)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Fetch all modules ordered
  const { data: rawModules } = await supabase
    .from("modules")
    .select("*")
    .order("order_index", { ascending: true });

  const modules = (rawModules ?? []) as ModuleRow[];
  const moduleMap = new Map<string, ModuleRow>();
  modules.forEach((m) => moduleMap.set(m.id, m));

  // 3. Fetch all lessons ordered
  const { data: rawLessons } = await supabase
    .from("lessons")
    .select("*")
    .order("order_index", { ascending: true });

  const lessons = (rawLessons ?? []) as LessonRow[];
  const lessonMap = new Map<string, LessonRow>();
  lessons.forEach((l) => lessonMap.set(l.id, l));

  // 4. Fetch all interactive practice blocks
  const { data: rawBlocks } = await supabase
    .from("lesson_blocks")
    .select("*")
    .in("type", ["quiz_mcq", "flashcard_set", "quiz_open", "code_exercise"])
    .order("order_index", { ascending: true });

  const blocks = (rawBlocks ?? []) as LessonBlockRow[];

  // 5. Fetch user progress if authenticated
  let userProgressRows: UserProgressRow[] = [];
  if (user) {
    const { data: rawProgress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id);
    userProgressRows = (rawProgress ?? []) as UserProgressRow[];
  }

  const progressMap = new Map<string, UserProgressRow>();
  userProgressRows.forEach((p) => {
    progressMap.set(p.lesson_id, p);
  });

  // 6. Transform blocks into PracticeItems
  let totalQuestions = 0;
  let totalCards = 0;

  const practiceItems: PracticeItem[] = [];

  for (const block of blocks) {
    const lesson = lessonMap.get(block.lesson_id);
    if (!lesson) continue;

    const currentModule = moduleMap.get(lesson.module_id);
    if (!currentModule) continue;

    const content = (block.content_json || {}) as Record<string, any>;
    const progress = progressMap.get(lesson.id);

    let itemCount = 0;
    let defaultTitle = "";

    if (block.type === "quiz_mcq") {
      if (Array.isArray(content.questions) && content.questions.length > 0) {
        itemCount = content.questions.length;
      } else if (content.question) {
        itemCount = 1;
      }
      totalQuestions += itemCount;
      defaultTitle = content.title || `Test Grilă: ${lesson.title}`;
    } else if (block.type === "flashcard_set") {
      if (Array.isArray(content.cards) && content.cards.length > 0) {
        itemCount = content.cards.length;
      } else if (Array.isArray(content.flashcards) && content.flashcards.length > 0) {
        itemCount = content.flashcards.length;
      }
      totalCards += itemCount;
      defaultTitle = content.title || `Set Flashcards: ${lesson.title}`;
    } else {
      itemCount = 1;
      defaultTitle = content.title || `Aplicație Practică: ${lesson.title}`;
    }

    practiceItems.push({
      id: block.id,
      type: block.type as BlockType,
      orderIndex: block.order_index,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonSlug: lesson.slug,
      lessonOrderIndex: lesson.order_index,
      moduleId: currentModule.id,
      moduleTitle: currentModule.title,
      moduleSlug: currentModule.slug,
      moduleOrderIndex: currentModule.order_index,
      title: defaultTitle,
      itemCount,
      passingScore: content.passing_score_pct ?? 70,
      userScore: progress?.score ?? null,
      userStatus: (progress?.status === "completed" || progress?.status === "in_progress") ? progress.status : null,
      rawBlock: block,
    });
  }

  // Sort practice items by Module order, then Lesson order, then block order
  practiceItems.sort((a, b) => {
    if (a.moduleOrderIndex !== b.moduleOrderIndex) {
      return a.moduleOrderIndex - b.moduleOrderIndex;
    }
    if (a.lessonOrderIndex !== b.lessonOrderIndex) {
      return a.lessonOrderIndex - b.lessonOrderIndex;
    }
    return a.orderIndex - b.orderIndex;
  });

  // Calculate score statistics
  const scoredItems = practiceItems.filter((i) => i.userScore !== null);
  const userAverageScore =
    scoredItems.length > 0
      ? scoredItems.reduce((acc, curr) => acc + (curr.userScore || 0), 0) / scoredItems.length
      : null;

  const completedLessons = new Set(
    userProgressRows.filter((p) => p.status === "completed").map((p) => p.lesson_id)
  );

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <PracticeClient
          items={practiceItems}
          modules={modules}
          isGuest={!user}
          totalQuestions={totalQuestions}
          totalCards={totalCards}
          userAverageScore={userAverageScore}
          completedCount={completedLessons.size}
        />
      </div>
    </div>
  );
}
