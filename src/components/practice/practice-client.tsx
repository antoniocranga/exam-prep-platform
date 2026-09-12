"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  HelpCircle,
  Sparkles,
  Award,
  Search,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Filter,
  Check,
  Code,
  ChevronRight,
  LogIn,
} from "lucide-react";
import { LessonBlockRow, ModuleRow, BlockType } from "@/types/database.types";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LessonBlockRenderer } from "@/components/blocks/lesson-block-renderer";
import { cn } from "@/lib/utils";

export interface PracticeItem {
  id: string;
  type: BlockType;
  orderIndex: number;
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  lessonOrderIndex: number;
  moduleId: string;
  moduleTitle: string;
  moduleSlug: string;
  moduleOrderIndex: number;
  title: string;
  itemCount: number;
  passingScore?: number;
  userScore: number | null;
  userStatus: "completed" | "in_progress" | null;
  rawBlock: LessonBlockRow;
}

interface PracticeClientProps {
  items: PracticeItem[];
  modules: ModuleRow[];
  isGuest: boolean;
  totalQuestions: number;
  totalCards: number;
  userAverageScore: number | null;
  completedCount: number;
}

export function PracticeClient({
  items,
  modules,
  isGuest,
  totalQuestions,
  totalCards,
  userAverageScore,
  completedCount,
}: PracticeClientProps) {
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [selectedModule, setSelectedModule] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeDrillBlock, setActiveDrillBlock] = React.useState<LessonBlockRow | null>(null);
  const [activeItemMeta, setActiveItemMeta] = React.useState<PracticeItem | null>(null);

  // Filter items based on active criteria
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (selectedType !== "all" && item.type !== selectedType) {
        return false;
      }
      // Module filter
      if (selectedModule !== "all" && item.moduleId !== selectedModule) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchLesson = item.lessonTitle.toLowerCase().includes(query);
        const matchModule = item.moduleTitle.toLowerCase().includes(query);
        if (!matchTitle && !matchLesson && !matchModule) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedType, selectedModule, searchQuery]);

  // Counts by type
  const mcqCount = React.useMemo(
    () => items.filter((i) => i.type === "quiz_mcq").length,
    [items]
  );
  const flashcardCount = React.useMemo(
    () => items.filter((i) => i.type === "flashcard_set").length,
    [items]
  );
  const exerciseCount = React.useMemo(
    () => items.filter((i) => i.type === "code_exercise" || i.type === "quiz_open").length,
    [items]
  );

  const handleOpenDrill = (item: PracticeItem) => {
    setActiveItemMeta(item);
    setActiveDrillBlock(item.rawBlock);
  };

  const handleCloseDrill = () => {
    setActiveDrillBlock(null);
    setActiveItemMeta(null);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Top Guest Notice */}
      {isGuest && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-foreground">Mod Oaspete Activ</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Te poți antrena liber cu toate testele și flashcardurile. Creează un cont gratuit
                pentru a-ți memora scorurile și a măsura progresul pe fiecare zi de studiu.
              </p>
            </div>
          </div>
          <Link href="/auth/signin?redirect=/practice">
            <Button size="sm" className="font-semibold text-xs shrink-0 rounded-xl">
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              Autentificare
            </Button>
          </Link>
        </div>
      )}

      {/* Hero Title & Subtitle */}
      <div className="relative rounded-3xl overflow-hidden border border-border/70 bg-gradient-to-br from-card via-background to-primary/5 p-6 sm:p-10 shadow-xs">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CENTRU DE ANTRENAMENT & AUTOEVALUARE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground font-heading">
            Practică & Testare Activă
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Consolidează legislația și metodologia didactică prin teste grilă oficiale și seturi de
            flashcards cu repetare spațiată, ordonate pe cele 20 de zile ale curriculei.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 mt-8 pt-8 border-t border-border/60">
          <div className="rounded-2xl border border-border/60 bg-background/60 backdrop-blur-xs p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Activități</span>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{items.length}</div>
            <p className="text-[11px] text-muted-foreground">grile și flashcards disponibile</p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/60 backdrop-blur-xs p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Teste Grilă</span>
              <HelpCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{mcqCount}</div>
            <p className="text-[11px] text-muted-foreground">
              ~{totalQuestions} întrebări cu explicații
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/60 backdrop-blur-xs p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Flashcards</span>
              <Layers className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{flashcardCount}</div>
            <p className="text-[11px] text-muted-foreground">
              ~{totalCards} noțiuni cheie de reținut
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/60 backdrop-blur-xs p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {isGuest ? "Status Cont" : "Scor Mediu"}
              </span>
              <Award className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">
              {isGuest
                ? "Liber"
                : userAverageScore !== null
                ? `${Math.round(userAverageScore)}%`
                : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isGuest ? "acces nerestricționat" : `${completedCount} lecții promovate`}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Caută după titlu, zi sau noțiune..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-card border-border/80 focus-visible:ring-primary"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
              className="rounded-full text-xs font-semibold h-8"
            >
              Toate ({items.length})
            </Button>
            <Button
              variant={selectedType === "quiz_mcq" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("quiz_mcq")}
              className="rounded-full text-xs font-semibold h-8 gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              Grile MCQ ({mcqCount})
            </Button>
            <Button
              variant={selectedType === "flashcard_set" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("flashcard_set")}
              className="rounded-full text-xs font-semibold h-8 gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              Flashcards ({flashcardCount})
            </Button>
            {exerciseCount > 0 && (
              <Button
                variant={selectedType === "code_exercise" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("code_exercise")}
                className="rounded-full text-xs font-semibold h-8 gap-1.5"
              >
                <Code className="w-3.5 h-3.5 text-sky-500" />
                Exerciții ({exerciseCount})
              </Button>
            )}
          </div>
        </div>

        {/* Module Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="text-muted-foreground font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Modul:
          </span>
          <button
            type="button"
            onClick={() => setSelectedModule("all")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all font-medium whitespace-nowrap cursor-pointer",
              selectedModule === "all"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Toate Modulele
          </button>
          {modules.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedModule(m.id)}
              className={cn(
                "px-3 py-1 rounded-lg transition-all font-medium whitespace-nowrap cursor-pointer",
                selectedModule === m.id
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Săptămâna {m.order_index}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <div>
          Se afișează{" "}
          <span className="font-bold text-foreground">{filteredItems.length}</span>{" "}
          din {items.length} sesiuni de practică
        </div>
        {(searchQuery || selectedType !== "all" || selectedModule !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedType("all");
              setSelectedModule("all");
              setSearchQuery("");
            }}
            className="h-7 text-xs text-primary hover:text-primary"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Resetează filtrele
          </Button>
        )}
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
            <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold">Nu au fost găsite activități</CardTitle>
            <CardDescription className="text-sm">
              Nicio sesiune de antrenament nu corespunde criteriilor tale de căutare sau filtrare.
            </CardDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedType("all");
                setSelectedModule("all");
                setSearchQuery("");
              }}
              className="mt-2 text-xs rounded-xl"
            >
              Resetează filtrele
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isMcq = item.type === "quiz_mcq";
            const isFlashcard = item.type === "flashcard_set";
            const isPassed = (item.userScore ?? 0) >= (item.passingScore ?? 70);

            return (
              <Card
                key={`${item.id}-${item.orderIndex}`}
                className="group relative flex flex-col justify-between border-border/70 hover:border-primary/40 hover:shadow-md transition-all rounded-2xl bg-card overflow-hidden"
              >
                <div className="p-5 space-y-3.5">
                  {/* Card Top Pill & Day */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-semibold px-2.5 py-0.5 rounded-md gap-1.5",
                        isMcq && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        isFlashcard && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        !isMcq && !isFlashcard && "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      )}
                    >
                      {isMcq ? (
                        <>
                          <HelpCircle className="w-3 h-3" />
                          <span>Test Grilă</span>
                        </>
                      ) : isFlashcard ? (
                        <>
                          <Layers className="w-3 h-3" />
                          <span>Flashcards</span>
                        </>
                      ) : (
                        <>
                          <Code className="w-3 h-3" />
                          <span>Exercițiu</span>
                        </>
                      )}
                    </Badge>

                    <span className="text-[11px] text-muted-foreground font-mono">
                      Săpt. {item.moduleOrderIndex} • Ziua {item.lessonOrderIndex}
                    </span>
                  </div>

                  {/* Title & Lesson context */}
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {item.lessonTitle}
                    </p>
                  </div>

                  {/* Details Pill */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-medium text-foreground/80 bg-muted/60 px-2.5 py-1 rounded-md">
                      {isMcq
                        ? `${item.itemCount} întrebări • Prag: ${item.passingScore ?? 70}%`
                        : isFlashcard
                        ? `${item.itemCount} carduri active`
                        : "Exercițiu practic"}
                    </span>

                    {/* Score status */}
                    {item.userScore !== null ? (
                      <span
                        className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1",
                          isPassed
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        )}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {item.userScore}%
                      </span>
                    ) : item.userStatus === "completed" ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Completat
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="border-t border-border/60 bg-muted/20 px-4 py-3 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleOpenDrill(item)}
                    className="font-semibold text-xs rounded-xl flex-1 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    Exersează pe loc
                  </Button>

                  <Link
                    href={`/modules/${item.moduleSlug}/${item.lessonSlug}#block-${item.id}`}
                    className="inline-flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    title="Deschide în contextul lecției complete"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Interactive Quick Drill Dialog */}
      <Dialog
        open={Boolean(activeDrillBlock)}
        onOpenChange={(open) => {
          if (!open) handleCloseDrill();
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl border-border/80 shadow-2xl bg-background">
          {activeItemMeta && activeDrillBlock && (
            <div className="space-y-6">
              <DialogHeader className="space-y-2 border-b border-border/70 pb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <span>Modulul {activeItemMeta.moduleOrderIndex}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Ziua {activeItemMeta.lessonOrderIndex}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-foreground font-semibold">
                    {activeItemMeta.lessonTitle}
                  </span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-extrabold tracking-tight font-heading">
                  {activeItemMeta.title}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                  Autoevaluare directă. Răspunde la întrebări sau parcurge flashcardurile;
                  rezultatele se sincronizează automat în contul tău.
                </DialogDescription>
              </DialogHeader>

              {/* Render the actual interactive block */}
              <div className="pt-2">
                <LessonBlockRenderer block={activeDrillBlock} />
              </div>

              {/* Drill Footer with direct link to lesson theory */}
              <div className="pt-4 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">
                  Vrei să aprofundezi teoria aferentă acestei tematici?
                </span>
                <Link
                  href={`/modules/${activeItemMeta.moduleSlug}/${activeItemMeta.lessonSlug}`}
                  onClick={handleCloseDrill}
                >
                  <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    Deschide lecția cu teorie completă
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
