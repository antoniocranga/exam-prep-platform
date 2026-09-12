import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronRight, ArrowLeft, ArrowRight, BookOpen, Layers, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { LessonBlockRenderer } from "@/components/blocks/lesson-block-renderer";
import { LessonBlockNavigator } from "@/components/blocks/lesson-block-navigator";
import { LessonProgressButton } from "@/components/lesson-progress-button";
import { getUserLessonProgress } from "@/app/actions/progress";
import { ModuleRow, LessonRow, LessonBlockRow } from "@/types/database.types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const supabase = await createClient();

  const { data: moduleData } = await supabase
    .from("modules")
    .select("id, title")
    .eq("slug", slug)
    .maybeSingle();

  const moduleItem = moduleData as Pick<ModuleRow, "id" | "title"> | null;
  if (!moduleItem) return { title: "Lecție negăsită — ExamPrep" };

  const { data: lessonData } = await supabase
    .from("lessons")
    .select("title")
    .eq("slug", lessonSlug)
    .eq("module_id", moduleItem.id)
    .maybeSingle();

  const lesson = lessonData as Pick<LessonRow, "title"> | null;
  if (!lesson) return { title: "Lecție negăsită — ExamPrep" };

  return {
    title: `${lesson.title} — ${moduleItem.title} — ExamPrep`,
    description: `Studiu și recapitulare pentru ${lesson.title}.`,
  };
}

export default async function LessonDetailPage({ params }: Props) {
  const { slug, lessonSlug } = await params;
  const supabase = await createClient();

  // 1. Fetch Module
  const { data: moduleData, error: moduleError } = await supabase
    .from("modules")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (moduleError || !moduleData) {
    notFound();
  }

  const currentModule = moduleData as ModuleRow;

  // 2. Fetch Lesson
  const { data: lessonData, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", lessonSlug)
    .eq("module_id", currentModule.id)
    .maybeSingle();

  if (lessonError || !lessonData) {
    notFound();
  }

  const lesson = lessonData as LessonRow;

  // 3. Fetch Lesson Blocks
  const { data: blocksData } = await supabase
    .from("lesson_blocks")
    .select("*")
    .eq("lesson_id", lesson.id)
    .order("order_index", { ascending: true });

  const blockList = (blocksData ?? []) as LessonBlockRow[];

  // 4. Fetch Sibling Lessons for Next / Prev navigation
  const { data: siblingData } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", currentModule.id)
    .order("order_index", { ascending: true });

  const siblings = (siblingData ?? []) as LessonRow[];
  const currentIndex = siblings.findIndex((s) => s.id === lesson.id);
  const prevLesson = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : null;

  // 5. Fetch User Progress (if authenticated)
  const userProgress = await getUserLessonProgress(lesson.id);

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/modules" className="hover:text-foreground transition-colors">
          Module
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/modules/${currentModule.slug}`}
          className="hover:text-foreground transition-colors truncate max-w-[200px]"
        >
          {currentModule.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground truncate max-w-[250px]">
          {lesson.title}
        </span>
      </nav>

      {/* Lesson Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-7 sm:p-9 mb-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="font-semibold text-xs px-3 py-1 bg-primary/10 text-primary border-primary/25 rounded-full">
              Lecția {lesson.order_index}
            </Badge>
            <Badge variant="secondary" className="capitalize text-xs px-3 py-1 rounded-full">
              {lesson.type}
            </Badge>
            {blockList.length > 0 && (
              <>
                <Badge variant="outline" className="text-xs text-muted-foreground rounded-full">
                  {blockList.length} {blockList.length === 1 ? "secțiune" : "secțiuni"}
                </Badge>
                <Badge variant="outline" className="text-xs text-muted-foreground flex items-center gap-1 rounded-full">
                  <Clock className="h-3 w-3" />
                  <span>~{Math.max(5, blockList.length * 4)} min</span>
                </Badge>
              </>
            )}
          </div>
          {lesson.scheduled_date && (
            <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2.5 py-1 rounded-full">
              Planificat: {lesson.scheduled_date}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-foreground">
              {lesson.title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Modulul {currentModule.order_index}: {currentModule.title}
            </p>
          </div>

          {/* Progress action button */}
          <div className="shrink-0 pt-2 sm:pt-0">
            <LessonProgressButton
              lessonId={lesson.id}
              initialStatus={userProgress?.status}
              initialScore={userProgress?.score}
            />
          </div>
        </div>
      </div>

      {/* Sticky Quick-Jump Section Navigator */}
      <LessonBlockNavigator blocks={blockList} />

      {/* Lesson Blocks Area */}
      <div className="space-y-6 mb-12">
        {blockList.length === 0 ? (
          <Card className="border-dashed p-10 text-center">
            <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
              <CardTitle className="text-lg font-semibold">
                Conținut în curs de procesare
              </CardTitle>
              <CardDescription className="text-sm">
                Materialele structurate și blocurile interactive pentru această lecție vor fi disponibile imediat ce sunt generate în baza de date.
              </CardDescription>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {blockList.map((block) => (
              <div key={block.id} id={`block-${block.id}`} className="scroll-mt-28">
                <LessonBlockRenderer block={block} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Completion Action Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 p-6 sm:p-7 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold text-foreground">Ai terminat de parcurs această lecție?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Marchează progresul pentru a actualiza statistica din panoul de control.
          </p>
        </div>
        <LessonProgressButton
          lessonId={lesson.id}
          initialStatus={userProgress?.status}
          initialScore={userProgress?.score}
        />
      </div>

      {/* Sibling Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/70">
        {prevLesson ? (
          <Link
            href={`/modules/${currentModule.slug}/${prevLesson.slug}`}
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="w-full justify-start gap-2.5 rounded-xl h-12 px-4 hover:border-primary/40 hover:bg-muted/60 transition-all">
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="text-left truncate max-w-[200px]">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Anterior</div>
                <div className="text-xs font-medium truncate">{prevLesson.title}</div>
              </div>
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            href={`/modules/${currentModule.slug}/${nextLesson.slug}`}
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="w-full justify-end gap-2.5 text-right rounded-xl h-12 px-4 hover:border-primary/40 hover:bg-muted/60 transition-all">
              <div className="text-right truncate max-w-[200px]">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Următor</div>
                <div className="text-xs font-medium truncate">{nextLesson.title}</div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Button>
          </Link>
        ) : (
          <Link href={`/modules/${currentModule.slug}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2 rounded-xl h-11 px-5">
              <Layers className="h-4 w-4" />
              <span>Înapoi la Modul</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
