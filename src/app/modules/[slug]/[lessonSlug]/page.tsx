import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronRight, ArrowLeft, ArrowRight, BookOpen, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { LessonBlockRenderer } from "@/components/blocks/lesson-block-renderer";
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
      <div className="rounded-2xl border bg-card p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-semibold text-xs">
              Lecția {lesson.order_index}
            </Badge>
            <Badge variant="secondary" className="capitalize text-xs">
              {lesson.type}
            </Badge>
          </div>
          {lesson.scheduled_date && (
            <span className="text-xs text-muted-foreground font-mono">
              Planificat: {lesson.scheduled_date}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          {lesson.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Modulul {currentModule.order_index}: {currentModule.title}
        </p>
      </div>

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
          <div className="space-y-6">
            {blockList.map((block) => (
              <LessonBlockRenderer key={block.id} block={block} />
            ))}
          </div>
        )}
      </div>

      {/* Sibling Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
        {prevLesson ? (
          <Link
            href={`/modules/${currentModule.slug}/${prevLesson.slug}`}
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="w-full justify-start gap-2">
              <ArrowLeft className="h-4 w-4" />
              <div className="text-left truncate max-w-[200px]">
                <div className="text-[10px] text-muted-foreground uppercase">Anterior</div>
                <div className="text-xs truncate">{prevLesson.title}</div>
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
            <Button variant="outline" className="w-full justify-end gap-2 text-right">
              <div className="text-right truncate max-w-[200px]">
                <div className="text-[10px] text-muted-foreground uppercase">Următor</div>
                <div className="text-xs truncate">{nextLesson.title}</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link href={`/modules/${currentModule.slug}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2">
              <Layers className="h-4 w-4" />
              <span>Înapoi la Modul</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
