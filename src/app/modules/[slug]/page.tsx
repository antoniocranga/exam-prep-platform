import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronRight, ArrowLeft, ArrowRight, BookOpen, Clock, FileText, HelpCircle, Code } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleRow, LessonRow } from "@/types/database.types";

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

  // Fetch module by slug
  const { data: moduleData, error: moduleError } = await supabase
    .from("modules")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (moduleError || !moduleData) {
    notFound();
  }

  const currentModule = moduleData as ModuleRow;

  // Fetch lessons for this module
  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", currentModule.id)
    .order("order_index", { ascending: true });

  const lessonList = (lessonsData ?? []) as LessonRow[];

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

      {/* Module Header */}
      <div className="rounded-2xl border bg-card p-6 sm:p-8 mb-10 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="font-semibold text-xs px-2.5 py-0.5">
            Modulul {currentModule.order_index}
          </Badge>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground font-medium">
            {lessonList.length} {lessonList.length === 1 ? "lecție" : "lecții"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
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
        </div>

        {lessonList.length === 0 ? (
          <Card className="border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nu există lecții asociate acestui modul în prezent.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {lessonList.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/modules/${currentModule.slug}/${lesson.slug}`}
                className="block group"
              >
                <Card className="transition-all hover:border-foreground/30 hover:shadow-sm">
                  <CardHeader className="p-4 sm:p-5 flex flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {getLessonTypeIcon(lesson.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Lecția {lesson.order_index}
                          </span>
                          {getLessonTypeBadge(lesson.type)}
                          {lesson.scheduled_date && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {lesson.scheduled_date}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-base sm:text-lg font-semibold truncate group-hover:text-primary transition-colors">
                          {lesson.title}
                        </CardTitle>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
