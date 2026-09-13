"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  Play,
  Pause,
  Save,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  BookOpen,
  Scale,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MockExamStructure } from "@/lib/exams/mock-exams";
import { submitMockExamAttemptAction } from "@/app/actions/exam-actions";
import { cn } from "@/lib/utils";

export interface ExamRunnerProps {
  exam: MockExamStructure;
}

export function ExamRunner({ exam }: ExamRunnerProps) {
  const draftKey = `simulare_draft_${exam.id}`;
  const initialDuration = exam.duration_minutes * 60;

  // Restore draft lazily from localStorage on client
  const [timeLeft, setTimeLeft] = React.useState<number>(() => {
    if (typeof window === "undefined") return initialDuration;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (typeof data.timeLeft === "number" && data.timeLeft > 0) return data.timeLeft;
      }
    } catch {
      // ignore
    }
    return initialDuration;
  });

  const [subiectul1Answers, setSubiectul1Answers] = React.useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.subiectul1Answers) return data.subiectul1Answers;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [subiectul2Text, setSubiectul2Text] = React.useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (typeof data.subiectul2Text === "string") return data.subiectul2Text;
      }
    } catch {
      // ignore
    }
    return "";
  });

  const [subiectul3Text, setSubiectul3Text] = React.useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (typeof data.subiectul3Text === "string") return data.subiectul3Text;
      }
    } catch {
      // ignore
    }
    return "";
  });

  const [isPaused, setIsPaused] = React.useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<string>("instructiuni");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [sub1Score, setSub1Score] = React.useState<number>(0);
  const [selfScoreSub2, setSelfScoreSub2] = React.useState<number>(25);
  const [selfScoreSub3, setSelfScoreSub3] = React.useState<number>(25);

  // Auto-save draft periodically
  React.useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      try {
        const payload = {
          timeLeft,
          subiectul1Answers,
          subiectul2Text,
          subiectul3Text,
          timestamp: Date.now(),
        };
        localStorage.setItem(draftKey, JSON.stringify(payload));
        const now = new Date();
        setLastSavedTime(
          `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
        );
      } catch {
        // ignore
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [draftKey, timeLeft, subiectul1Answers, subiectul2Text, subiectul3Text, isSubmitted]);

  // Final evaluation logic
  const calculateAndSubmit = React.useCallback(async () => {
    setIsConfirmModalOpen(false);

    let correctCount = 0;
    exam.subiectul_1.questions.forEach((q) => {
      const userSelected = subiectul1Answers[q.id];
      if (typeof userSelected === "number" && userSelected === q.correct_option_index) {
        correctCount++;
      }
    });

    const calculatedSub1 = correctCount * 3;
    setSub1Score(calculatedSub1);
    setIsSubmitted(true);
    setActiveTab("rezultate");

    const timeSpent = initialDuration - timeLeft;
    const estimatedTotal = calculatedSub1 + selfScoreSub2 + selfScoreSub3 + exam.oficiu_points;

    await submitMockExamAttemptAction({
      examId: exam.id,
      subiectul1Answers,
      subiectul2Text,
      subiectul3Text,
      scoreSubiectul1: calculatedSub1,
      totalScore: estimatedTotal,
      timeSpentSeconds: timeSpent,
    });

    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
  }, [exam, subiectul1Answers, initialDuration, timeLeft, selfScoreSub2, selfScoreSub3, draftKey, subiectul2Text, subiectul3Text]);

  const handleTimeExpired = React.useCallback(() => {
    setIsConfirmModalOpen(false);
    calculateAndSubmit();
  }, [calculateAndSubmit]);

  // Timer interval
  React.useEffect(() => {
    if (isPaused || isSubmitted || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isSubmitted, timeLeft, handleTimeExpired]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const countWords = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setSubiectul1Answers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const answeredCountSub1 = Object.keys(subiectul1Answers).length;
  const totalQuestionsSub1 = exam.subiectul_1.questions.length;
  const totalEstimatedScore = sub1Score + selfScoreSub2 + selfScoreSub3 + exam.oficiu_points;

  return (
    <div className="min-h-screen pb-20">
      {/* Sticky Top Header with Floating Timer */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md shadow-xs">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link
              href="/simulare"
              className="text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">Toate Simulările</span>
            </Link>
            <div className="h-4 w-px bg-border/80 hidden md:block" />
            <div className="truncate">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.2 rounded-full border-primary/30 text-primary">
                  {exam.badge_label}
                </Badge>
                <span className="text-xs sm:text-sm font-bold truncate text-foreground">
                  {exam.title}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {lastSavedTime && (
              <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                <Save className="h-3.5 w-3.5 text-emerald-500" />
                <span>Salvat la {lastSavedTime}</span>
              </div>
            )}

            {/* Countdown timer */}
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono font-bold text-xs sm:text-sm shadow-xs transition-colors select-none",
                timeLeft <= 600
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse"
                  : timeLeft <= 1800
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-muted text-foreground border-border/80"
              )}
            >
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>{formatTime(timeLeft)}</span>
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="hover:text-primary transition-colors p-0.5"
                title={isPaused ? "Reia cronometrul" : "Pauză cronometru"}
              >
                {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              </button>
            </div>

            {!isSubmitted ? (
              <Button
                size="sm"
                onClick={() => setIsConfirmModalOpen(true)}
                className="h-9 px-3.5 gap-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Finalizează</span>
              </Button>
            ) : (
              <Badge variant="default" className="bg-emerald-600 text-white gap-1 px-3 py-1 text-xs">
                <Check className="h-3.5 w-3.5" /> Predat
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 sm:px-6 max-w-5xl pt-8 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-auto p-1 bg-muted/60 rounded-2xl flex flex-wrap gap-1 border border-border/60">
            <TabsTrigger
              value="instructiuni"
              className="rounded-xl px-3.5 py-2 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Ghid & Barem</span>
            </TabsTrigger>

            <TabsTrigger
              value="subiectul_1"
              className="rounded-xl px-3.5 py-2 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Subiectul I (30p)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary">
                {answeredCountSub1}/{totalQuestionsSub1}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="subiectul_2"
              className="rounded-xl px-3.5 py-2 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Subiectul II (30p)</span>
              {subiectul2Text.trim() && (
                <span className="ml-1 text-[10px] text-muted-foreground">
                  ({countWords(subiectul2Text)} cuv)
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="subiectul_3"
              className="rounded-xl px-3.5 py-2 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Subiectul III (30p)</span>
              {subiectul3Text.trim() && (
                <span className="ml-1 text-[10px] text-muted-foreground">
                  ({countWords(subiectul3Text)} cuv)
                </span>
              )}
            </TabsTrigger>

            {isSubmitted && (
              <TabsTrigger
                value="rezultate"
                className="rounded-xl px-3.5 py-2 text-xs font-bold gap-1.5 bg-emerald-500/10 text-emerald-600 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                <Award className="h-3.5 w-3.5" />
                <span>Rezultate & Barem</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* TAB 1: Instructiuni */}
          <TabsContent value="instructiuni" className="space-y-6 pt-4">
            <Card className="border-border/80 bg-card p-6 sm:p-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                    {exam.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Format oficial de examen (100 puncte totale, 180 minute continue)
                  </p>
                </div>
                <Badge variant="outline" className="px-3 py-1 font-mono text-xs">
                  Oficiu: {exam.oficiu_points}p garantate
                </Badge>
              </div>

              {exam.instructions_callout && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl space-y-1 text-xs">
                  <h4 className="font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    {exam.instructions_callout.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {exam.instructions_callout.content}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-muted/40 p-4 rounded-xl border border-border/50 space-y-2">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-emerald-500" />
                    Subiectul I (30p)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    10 întrebări grilă cu răspuns unic din Legea 198/2023, ROFUIP și metodologii.
                    Fiecare răspuns corect valorează 3 puncte.
                  </p>
                </div>

                <div className="bg-muted/40 p-4 rounded-xl border border-border/50 space-y-2">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    Subiectul II (30p)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Cerință de didactică, proiectare curriculară și evaluare formativă (John Hattie).
                    Se redactează în 300-400 de cuvinte.
                  </p>
                </div>

                <div className="bg-muted/40 p-4 rounded-xl border border-border/50 space-y-2">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Subiectul III (30p)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Speță complexă de conducere, răspundere disciplinară și modele de leadership (Tony Bush),
                    notată pe baza baremului oficial pe 5 criterii.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setActiveTab("subiectul_1")}
                  className="gap-2 rounded-xl h-11 px-5 font-bold cursor-pointer"
                >
                  <span>Începe cu Subiectul I</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: Subiectul I (30p) */}
          <TabsContent value="subiectul_1" className="space-y-6 pt-4">
            <Card className="border-border/80 bg-card p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {exam.subiectul_1.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {exam.subiectul_1.description}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  {answeredCountSub1} din {totalQuestionsSub1} completate
                </Badge>
              </div>

              {/* Quick Jump Numbers */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {exam.subiectul_1.questions.map((q, qIndex) => {
                  const isAnswered = typeof subiectul1Answers[q.id] === "number";
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(`q-${q.id}`);
                        el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className={cn(
                        "h-8 w-8 rounded-lg text-xs font-bold transition-all border select-none cursor-pointer",
                        isAnswered
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted text-muted-foreground border-border/70 hover:bg-muted/80"
                      )}
                    >
                      {qIndex + 1}
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="space-y-4">
              {exam.subiectul_1.questions.map((q) => {
                const selectedOption = subiectul1Answers[q.id];

                return (
                  <Card
                    key={q.id}
                    id={`q-${q.id}`}
                    className="border-border/80 bg-card hover:border-primary/40 transition-colors p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                        {q.question}
                      </h4>
                      <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                        3 puncte
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => {
                        const isSelected = selectedOption === optIndex;

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => handleSelectOption(q.id, optIndex)}
                            className={cn(
                              "w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-between gap-3 select-none cursor-pointer",
                              isSelected
                                ? "bg-primary/10 border-primary text-primary dark:bg-primary/20 font-semibold shadow-xs"
                                : "bg-muted/30 border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <span>{opt}</span>
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                                isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                              )}
                            >
                              {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {typeof selectedOption === "number" && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const copy = { ...subiectul1Answers };
                            delete copy[q.id];
                            setSubiectul1Answers(copy);
                          }}
                          className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                        >
                          Deselectează răspunsul
                        </button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab("instructiuni")}
                className="rounded-xl h-11 text-xs font-semibold gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Înapoi la Ghid</span>
              </Button>
              <Button
                onClick={() => setActiveTab("subiectul_2")}
                className="rounded-xl h-11 text-xs font-bold gap-1.5"
              >
                <span>Mergi la Subiectul II</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* TAB 3: Subiectul II (30p) */}
          <TabsContent value="subiectul_2" className="space-y-6 pt-4">
            <Card className="border-border/80 bg-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {exam.subiectul_2.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Redactați un eseu structurat / răspuns aplicat conform cerințelor de mai jos.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {exam.subiectul_2.points} puncte
                </Badge>
              </div>

              <div className="bg-muted/40 p-4 rounded-xl border border-border/60 text-xs sm:text-sm text-foreground leading-relaxed font-medium">
                {exam.subiectul_2.question}
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2 text-xs">
                <h4 className="font-bold text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Criterii de Evaluare Oficiale (Barem 30 Puncte):
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {exam.subiectul_2.rubric_criteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>Spațiu de redactare candidat:</span>
                  <span className="font-mono">
                    <strong>{countWords(subiectul2Text)}</strong> cuvinte | {subiectul2Text.length} caractere
                  </span>
                </div>

                <Textarea
                  value={subiectul2Text}
                  onChange={(e) => setSubiectul2Text(e.target.value)}
                  placeholder="Introduceți rezolvarea argumentată aici (structurată pe paragrafe, cu terminologie didactică și referințe normative)..."
                  rows={12}
                  className="w-full text-xs sm:text-sm font-sans p-4 rounded-2xl bg-background border-border/80 focus-visible:ring-primary/40 leading-relaxed resize-y"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("subiectul_1")}
                  className="rounded-xl h-11 text-xs font-semibold gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Înapoi la Subiectul I</span>
                </Button>
                <Button
                  onClick={() => setActiveTab("subiectul_3")}
                  className="rounded-xl h-11 text-xs font-bold gap-1.5"
                >
                  <span>Mergi la Subiectul III</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: Subiectul III (30p) */}
          <TabsContent value="subiectul_3" className="space-y-6 pt-4">
            <Card className="border-border/80 bg-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {exam.subiectul_3.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Studiu de caz managerial / speță de conducere analizată pe baza celor 5 criterii oficiale.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {exam.subiectul_3.points} puncte
                </Badge>
              </div>

              <div className="bg-muted/40 p-4 rounded-xl border border-border/60 text-xs sm:text-sm text-foreground leading-relaxed font-medium">
                {exam.subiectul_3.question}
              </div>

              <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/20 space-y-2 text-xs">
                <h4 className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Barem de Notare pe 5 Criterii (6 puncte per criteriu):
                </h4>
                <ul className="list-decimal pl-5 space-y-1 text-muted-foreground">
                  {exam.subiectul_3.rubric_criteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>Redactare analiză speță și decizie managerială:</span>
                  <span className="font-mono">
                    <strong>{countWords(subiectul3Text)}</strong> cuvinte | {subiectul3Text.length} caractere
                  </span>
                </div>

                <Textarea
                  value={subiectul3Text}
                  onChange={(e) => setSubiectul3Text(e.target.value)}
                  placeholder="Redactați analiza speței aici: încadrare juridică (Legea 198/2023), aplicare Tony Bush (Formal/Colegial), pași procedurali și decizii administrative..."
                  rows={14}
                  className="w-full text-xs sm:text-sm font-sans p-4 rounded-2xl bg-background border-border/80 focus-visible:ring-primary/40 leading-relaxed resize-y"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("subiectul_2")}
                  className="rounded-xl h-11 text-xs font-semibold gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Înapoi la Subiectul II</span>
                </Button>
                <Button
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="rounded-xl h-11 text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Finalizează Simularea</span>
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 5: Rezultate & Autoevaluare */}
          {isSubmitted && (
            <TabsContent value="rezultate" className="space-y-6 pt-4">
              <Card className="border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-7 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <Badge className="bg-emerald-600 text-white gap-1.5 text-xs">
                      <Check className="h-3.5 w-3.5" /> Examen Finalizat cu Succes
                    </Badge>
                    <h2 className="text-2xl font-extrabold text-foreground">
                      Rezultat & Autoevaluare Barem
                    </h2>
                  </div>

                  <div className="text-center sm:text-right bg-background/80 p-4 rounded-2xl border border-border/80 shadow-xs">
                    <div className="text-3xl sm:text-4xl font-extrabold text-primary">
                      {totalEstimatedScore} / 100
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      Punctaj total estimat
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-card p-3.5 rounded-xl border border-border/60 space-y-1">
                    <span className="text-muted-foreground">Subiectul I (Grilă):</span>
                    <div className="font-bold text-base text-foreground">{sub1Score} / 30p</div>
                  </div>
                  <div className="bg-card p-3.5 rounded-xl border border-border/60 space-y-1">
                    <span className="text-muted-foreground">Subiectul II (Didactică):</span>
                    <div className="font-bold text-base text-foreground">{selfScoreSub2} / 30p</div>
                  </div>
                  <div className="bg-card p-3.5 rounded-xl border border-border/60 space-y-1">
                    <span className="text-muted-foreground">Subiectul III (Speță):</span>
                    <div className="font-bold text-base text-foreground">{selfScoreSub3} / 30p</div>
                  </div>
                  <div className="bg-card p-3.5 rounded-xl border border-border/60 space-y-1">
                    <span className="text-muted-foreground">Din Oficiu:</span>
                    <div className="font-bold text-base text-emerald-600">{exam.oficiu_points}p</div>
                  </div>
                </div>
              </Card>

              {/* Subiectul I Review */}
              <Card className="p-6 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" />
                  <span>Verificare Răspunsuri Subiectul I (Grilă)</span>
                </h3>

                <div className="space-y-3">
                  {exam.subiectul_1.questions.map((q) => {
                    const userSelected = subiectul1Answers[q.id];
                    const isCorrect = userSelected === q.correct_option_index;

                    return (
                      <div
                        key={q.id}
                        className={cn(
                          "p-4 rounded-xl border text-xs space-y-2",
                          isCorrect
                            ? "bg-emerald-500/5 border-emerald-500/30"
                            : "bg-rose-500/5 border-rose-500/30"
                        )}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{q.question}</span>
                          <span className={isCorrect ? "text-emerald-600" : "text-rose-600"}>
                            {isCorrect ? "+3 puncte" : "0 puncte"}
                          </span>
                        </div>

                        <div className="text-muted-foreground">
                          Răspunsul tău:{" "}
                          <strong>
                            {typeof userSelected === "number"
                              ? q.options[userSelected]
                              : "Nu ai selectat nicio opțiune"}
                          </strong>
                        </div>

                        {!isCorrect && typeof q.correct_option_index === "number" && (
                          <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Răspuns corect: {q.options[q.correct_option_index]}
                          </div>
                        )}

                        {q.explanation && (
                          <p className="text-[11px] text-muted-foreground italic bg-muted/40 p-2 rounded-lg">
                            Explicație: {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Subiectul II Exemplar */}
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-foreground">
                    Model de Răspuns Oficial — Subiectul II
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Autoevaluare Subiectul II:</span>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={selfScoreSub2}
                      onChange={(e) => setSelfScoreSub2(Number(e.target.value))}
                      className="w-14 h-8 text-center rounded-lg border border-border bg-background font-bold text-xs"
                    />
                    <span>/ 30p</span>
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap border border-border/60">
                  {exam.subiectul_2.sample_answer}
                </div>
              </Card>

              {/* Subiectul III Exemplar */}
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-foreground">
                    Model de Rezolvare Speță — Subiectul III
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Autoevaluare Subiectul III:</span>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={selfScoreSub3}
                      onChange={(e) => setSelfScoreSub3(Number(e.target.value))}
                      className="w-14 h-8 text-center rounded-lg border border-border bg-background font-bold text-xs"
                    />
                    <span>/ 30p</span>
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap border border-border/60">
                  {exam.subiectul_3.sample_answer}
                </div>
              </Card>

              <div className="flex justify-center pt-4">
                <Link href="/simulare">
                  <Button variant="outline" className="gap-2 rounded-xl h-11 px-6">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Înapoi la Toate Simulările</span>
                  </Button>
                </Link>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Submission Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span>Finalizezi simularea de examen?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Verifică sumarul răspunsurilor înainte de predarea definitivă a lucrării.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-muted-foreground">Subiectul I (Grilă):</span>
              <strong>
                {answeredCountSub1} din {totalQuestionsSub1} întrebări completate
              </strong>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-muted-foreground">Subiectul II (Didactică):</span>
              <strong>{countWords(subiectul2Text)} cuvinte redactate</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-muted-foreground">Subiectul III (Speță):</span>
              <strong>{countWords(subiectul3Text)} cuvinte redactate</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-muted-foreground">Timp rămas:</span>
              <strong className="font-mono text-primary">{formatTime(timeLeft)}</strong>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Continuă Lucrul
            </Button>
            <Button
              size="sm"
              onClick={calculateAndSubmit}
              className="rounded-xl text-xs font-bold bg-primary text-primary-foreground"
            >
              Predă Lucrarea & Vezi Baremul
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
