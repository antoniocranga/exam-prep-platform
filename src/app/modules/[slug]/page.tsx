import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  FileText,
  HelpCircle,
  Code,
  Layers,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleRow, LessonRow, UserProgressRow, LessonBlockRow } from "@/types/database.types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("modules")
    .select("title, description")
    .eq("slug", slug)
    .maybeSingle();

  const mod = data as Pick<ModuleRow, "title" | "description"> | null;

  if (!mod) {
    return { title: "Modul negăsit — ExamPrep" };
  }

  return {
    title: `${mod.title} — ExamPrep`,
    description: mod.description ?? "Modul de pregătire pentru examen.",
  };
}

function getLessonTypeIcon(type: string) {
  switch (type) {
    case "quiz":
      return <HelpCircle className="h-4 w-4 text-purple-500" />;
    case "code":
      return <Code className="h-4 w-4 text-blue-500" />;
    case "markdown":
      return <FileText className="h-4 w-4 text-emerald-500" />;
    default:
      return <BookOpen className="h-4 w-4 text-amber-500" />;
  }
}

function getLessonTypeBadge(type: string) {
  switch (type) {
    case "quiz":
      return <Badge variant="secondary" className="text-xs">Grilă / Test</Badge>;
    case "code":
      return <Badge variant="secondary" className="text-xs">Exercițiu / Cod</Badge>;
    case "markdown":
      return <Badge variant="secondary" className="text-xs">Sinteză Teoretică</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">Interactiv</Badge>;
  }
}

export default async function ModuleDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch module by slug
  const { data: moduleData, error: moduleError } = await supabase
    .from("modules")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (moduleError || !moduleData) {
    notFound();
  }

  const currentModule = moduleData as ModuleRow;

  // 2. Fetch lessons for this module
  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", currentModule.id)
    .order("order_index", { ascending: true });

  const lessonList = (lessonsData ?? []) as LessonRow[];
  const lessonIds = lessonList.map((l) => l.id);

  // 3. Fetch block types for each lesson to render component badges
  const { data: blocksData } = await supabase
    .from("lesson_blocks")
    .select("id, lesson_id, type")
    .in("lesson_id", lessonIds);

  const blockItems = (blocksData ?? []) as Array<Pick<LessonBlockRow, "id" | "lesson_id" | "type">>;
  const blocksByLesson = new Map<string, string[]>();
  blockItems.forEach((b) => {
    const arr = blocksByLesson.get(b.lesson_id) || [];
    arr.push(b.type);
    blocksByLesson.set(b.lesson_id, arr);
  });

  // 4. Fetch user progress if authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const progressMap = new Map<string, UserProgressRow>();
  if (user && lessonIds.length > 0) {
    const { data: progressData } = await supabase
      .from("user_progress")
      .select("*")
      .in("lesson_id", lessonIds);
    const progressItems = (progressData ?? []) as UserProgressRow[];
    progressItems.forEach((p) => {
      progressMap.set(p.lesson_id, p);
    });
  }

  const completedCount = lessonList.filter(
    (l) => progressMap.get(l.id)?.status === "completed"
  ).length;

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/modules" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Module</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground truncate max-w-xs sm:max-w-md">
          {currentModule.title}
        </span>
      </nav>

      {/* Module Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-7 sm:p-9 mb-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-semibold text-xs px-3 py-1 bg-primary/10 text-primary border-primary/25 rounded-full">
              Modulul {currentModule.order_index}
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              {lessonList.length} {lessonList.length === 1 ? "lecție" : "lecții"}
            </span>
          </div>

          {user && lessonList.length > 0 && (
            <Badge
              variant={completedCount === lessonList.length ? "default" : "secondary"}
              className="text-xs gap-1.5 px-3 py-1 rounded-full font-medium"
            >
              {completedCount === lessonList.length && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
              <span>
                {completedCount} / {lessonList.length} completate
              </span>
            </Badge>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-foreground">
          {currentModule.title}
        </h1>
        {currentModule.description && (
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
            {currentModule.description}
          </p>
        )}
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Structura Lecțiilor</h2>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Apasă pe o lecție pentru a accesa sinteza și materialele interactive
          </span>
        </div>

        {lessonList.length === 0 ? (
          <Card className="rounded-2xl border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nu există lecții asociate acestui modul în prezent.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3.5">
            {lessonList.map((lesson) => {
              const types = blocksByLesson.get(lesson.id) || [];
              const progress = progressMap.get(lesson.id);
              const isCompleted = progress?.status === "completed";
              const hasScore = typeof progress?.score === "number";

              return (
                <Link
                  key={lesson.id}
                  href={`/modules/${currentModule.slug}/${lesson.slug}`}
                  className="block group"
                >
                  <Card className="rounded-2xl border border-border/80 transition-all duration-300 hover:border-primary/40 hover:shadow-md bg-card">
                    <CardHeader className="p-5 flex flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/70 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            getLessonTypeIcon(lesson.type)
                          )}
                        </div>
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Lecția {lesson.order_index}
                            </span>
                            {getLessonTypeBadge(lesson.type)}
                            {lesson.scheduled_date && (
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                                <Clock className="h-3 w-3" />
                                {lesson.scheduled_date}
                              </span>
                            )}
                            {hasScore && (
                              <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
                                Scor: {progress?.score}%
                              </Badge>
                            )}
                          </div>

                          <CardTitle className="text-base sm:text-lg font-bold truncate group-hover:text-primary transition-colors">
                            {lesson.title}
                          </CardTitle>

                          {/* Block Contents Breakdown Badges */}
                          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                            {types.includes("markdown") && (
                              <Badge variant="outline" className="text-[10px] font-normal gap-1 bg-muted/30">
                                <FileText className="h-2.5 w-2.5 text-emerald-600" />
                                <span>Sinteză</span>
                              </Badge>
                            )}
                            {types.includes("flashcard_set") && (
                              <Badge variant="outline" className="text-[10px] font-normal gap-1 bg-muted/30">
                                <Layers className="h-2.5 w-2.5 text-blue-600" />
                                <span>Flashcarduri</span>
                              </Badge>
                            )}
                            {types.includes("quiz_mcq") && (
                              <Badge variant="outline" className="text-[10px] font-normal gap-1 bg-muted/30">
                                <HelpCircle className="h-2.5 w-2.5 text-purple-600" />
                                <span>Test Grilă</span>
                              </Badge>
                            )}
                            {types.includes("code_exercise") && (
                              <Badge variant="outline" className="text-[10px] font-normal gap-1 bg-muted/30">
                                <Code className="h-2.5 w-2.5 text-amber-600" />
                                <span>Simulare</span>
                              </Badge>
                            )}
                            {types.length > 0 && (
                              <span className="text-[11px] text-muted-foreground pl-1">
                                • {types.length} {types.length === 1 ? "secțiune" : "secțiuni"} (~{Math.max(5, types.length * 4)} min)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="group-hover:translate-x-1 transition-transform"
                          aria-label="Deschide lecția"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
