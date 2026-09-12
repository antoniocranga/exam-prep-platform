import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  LogOut,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  CircleCheck,
  Circle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { signOut } from "@/app/auth/actions";
import { ModuleRow, LessonRow, UserProgressRow } from "@/types/database.types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panou de Control — ExamPrep",
  description: "Monitorizează progresul parcurgerii curriculei și scorul evaluărilor tale.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
  }

  // 1. Fetch live modules
  const { data: rawModules } = await supabase
    .from("modules")
    .select("*")
    .order("order_index", { ascending: true });

  const modules = (rawModules ?? []) as ModuleRow[];

  // 2. Fetch live lessons
  const { data: rawLessons } = await supabase
    .from("lessons")
    .select("*")
    .order("order_index", { ascending: true });

  const lessons = (rawLessons ?? []) as LessonRow[];

  // 3. Fetch user_progress for authenticated user (RLS-guaranteed)
  const { data: rawProgress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id);

  const progressRows = (rawProgress ?? []) as UserProgressRow[];

  // Create lookup map: lesson_id -> UserProgressRow
  const progressMap = new Map<string, UserProgressRow>();
  progressRows.forEach((p) => {
    progressMap.set(p.lesson_id, p);
  });

  // Calculate overall metrics
  const totalLessons = lessons.length;
  const completedLessonsCount = lessons.filter(
    (l) => progressMap.get(l.id)?.status === "completed"
  ).length;
  const overallPercentage =
    totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  // Average quiz score
  const scoredRows = progressRows.filter((p) => typeof p.score === "number");
  const averageScore =
    scoredRows.length > 0
      ? Math.round(
          scoredRows.reduce((acc, curr) => acc + (curr.score ?? 0), 0) /
            scoredRows.length
        )
      : null;

  // Compute per-module metrics
  const moduleStats = modules.map((currentModule) => {
    const moduleLessons = lessons.filter((l) => l.module_id === currentModule.id);
    const moduleTotal = moduleLessons.length;
    const moduleCompleted = moduleLessons.filter(
      (l) => progressMap.get(l.id)?.status === "completed"
    ).length;
    const modulePct =
      moduleTotal > 0 ? Math.round((moduleCompleted / moduleTotal) * 100) : 0;

    return {
      module: currentModule,
      lessons: moduleLessons,
      total: moduleTotal,
      completed: moduleCompleted,
      percentage: modulePct,
    };
  });

  const completedModulesCount = moduleStats.filter(
    (ms) => ms.total > 0 && ms.completed === ms.total
  ).length;

  // Find next uncompleted lesson to recommend
  const nextUpLesson =
    lessons.find((l) => progressMap.get(l.id)?.status !== "completed") ??
    lessons[0];

  const nextUpModule = nextUpLesson
    ? modules.find((m) => m.id === nextUpLesson.module_id)
    : null;

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-10 space-y-10">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              Sesiune Activă
            </Badge>
            <span className="text-xs text-muted-foreground font-mono truncate max-w-[220px]">
              {user.email}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Panou de Control</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Urmărește parcurgerea programei și performanța la simulări.
          </p>
        </div>

        <form action={signOut}>
          <Button variant="outline" size="sm" className="gap-2 self-start">
            <LogOut className="h-4 w-4" />
            <span>Deconectare</span>
          </Button>
        </form>
      </div>

      {/* Global Progress Overview Banner */}
      <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-semibold">
                Progres Global Curriculă
              </Badge>
              <span className="text-xs text-muted-foreground">
                {completedLessonsCount} din {totalLessons} lecții parcurse
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {overallPercentage}% Finalizat
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {overallPercentage === 100
                ? "Excelent! Ai parcurs întreaga materie a examenului."
                : "Continuă studiul zilnic pentru asimilarea completă a cadrului legislativ și managerial."}
            </p>
          </div>

          {nextUpLesson && nextUpModule && (
            <div className="w-full md:w-auto shrink-0">
              <Link href={`/modules/${nextUpModule.slug}/${nextUpLesson.slug}`}>
                <Button size="lg" className="w-full md:w-auto gap-2 shadow-sm font-semibold">
                  <BookOpen className="h-4 w-4" />
                  <span>Continuă Studiul</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-2">
          <Progress value={overallPercentage} className="h-2.5" />
        </div>
      </div>

      {/* High-Level Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Lecții Finalizate
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedLessonsCount} / {totalLessons}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overallPercentage}% din total
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Module Încheiate
            </CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedModulesCount} / {modules.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {modules.length > 0
                ? Math.round((completedModulesCount / modules.length) * 100)
                : 0}
              % din module
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Scor Mediu Teste
            </CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageScore !== null ? `${averageScore}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {scoredRows.length > 0
                ? `Calculat din ${scoredRows.length} evaluări`
                : "Nicio evaluare salvată"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Stare Autentificare
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-base font-semibold truncate text-foreground">
              Sincronizare Activă
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
              ID: {user.id.slice(0, 8)}...
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Module Progress Breakdown */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Progres pe Module</h2>
          <p className="text-sm text-muted-foreground">
            Defalcare în timp real a parcurgerii fiecărui modul de pregătire.
          </p>
        </div>

        <div className="space-y-6">
          {moduleStats.map((ms) => {
            const meta = (ms.module.metadata || {}) as Record<string, unknown>;
            const logicLevel = (meta.logic_level || "Standard") as string;

            return (
              <Card key={ms.module.id} className="shadow-sm overflow-hidden border">
                <CardHeader className="bg-muted/15 border-b p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          Modulul {ms.module.order_index}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {logicLevel}
                        </Badge>
                        {ms.completed === ms.total && ms.total > 0 && (
                          <Badge className="bg-emerald-600 text-white text-xs gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Complet</span>
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold">
                        <Link
                          href={`/modules/${ms.module.slug}`}
                          className="hover:underline"
                        >
                          {ms.module.title}
                        </Link>
                      </CardTitle>
                      {ms.module.description && (
                        <CardDescription className="text-xs line-clamp-2">
                          {ms.module.description}
                        </CardDescription>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold">{ms.percentage}%</div>
                      <div className="text-xs text-muted-foreground">
                        {ms.completed} din {ms.total} lecții
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <Progress value={ms.percentage} className="h-2" />
                  </div>
                </CardHeader>

                {/* Lesson rows list */}
                <CardContent className="p-0 divide-y">
                  {ms.lessons.map((lesson) => {
                    const p = progressMap.get(lesson.id);
                    const isCompleted = p?.status === "completed";
                    const hasScore = typeof p?.score === "number";

                    return (
                      <Link
                        key={lesson.id}
                        href={`/modules/${ms.module.slug}/${lesson.slug}`}
                        className="flex items-center justify-between p-4 sm:px-6 hover:bg-muted/40 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-4">
                          {isCompleted ? (
                            <CircleCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground font-mono">
                                Ziua {lesson.order_index}
                              </span>
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {lesson.type}
                              </Badge>
                            </div>
                            <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {lesson.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {hasScore && (
                            <Badge variant="secondary" className="text-xs font-mono">
                              Scor: {p?.score}%
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
