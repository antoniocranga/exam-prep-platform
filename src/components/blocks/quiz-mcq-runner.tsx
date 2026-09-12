"use client";

import * as React from "react";
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Award, ChevronRight, ChevronLeft, BookMarked, CloudCheck } from "lucide-react";
import { LessonBlockRow } from "@/types/database.types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { recordProgress } from "@/app/actions/progress";
import { cn } from "@/lib/utils";

interface McqQuestion {
  id?: string | number;
  question: string;
  options: Array<string | { text: string; id?: string | number }>;
  correct_index?: number;
  correct_answer?: string | number;
  explanation?: string;
  citation?: string;
}

interface QuizContent {
  title?: string;
  description?: string;
  passing_score_pct?: number;
  questions?: McqQuestion[];
  // Contract v1.0 single question fields:
  question?: string;
  options?: Array<string | { text: string; id?: string | number }>;
  correct_option_id?: string | number;
  explanation?: string;
  citations?: Array<{ citation?: string; locator?: string }>;
}

export function QuizMcqRunner({ block }: { block: LessonBlockRow }) {
  const content = (block.content_json || {}) as QuizContent;
  const title = content.title || "Test Grilă de Evaluare";
  const passingScore = content.passing_score_pct ?? 70;

  // Support both multi-question container (content.questions) and contract v1.0 single question payload
  const questions: McqQuestion[] = React.useMemo(() => {
    if (Array.isArray(content.questions) && content.questions.length > 0) {
      return content.questions;
    }
    if (content.question) {
      const rawOptions = Array.isArray(content.options) ? content.options : [];
      const correctId = content.correct_option_id;
      let correctIdx = 0;
      if (correctId !== undefined) {
        const idx = rawOptions.findIndex((opt: any) => 
          (typeof opt === "object" && opt !== null && opt.id === correctId) || opt === correctId
        );
        if (idx !== -1) correctIdx = idx;
      }
      const citationStr = Array.isArray(content.citations) && content.citations.length > 0
        ? content.citations[0].citation || content.citations[0].locator
        : undefined;

      return [{
        question: content.question,
        options: rawOptions,
        correct_index: correctIdx,
        correct_answer: correctId,
        explanation: content.explanation,
        citation: citationStr,
      }];
    }
    return [];
  }, [content]);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<string | null>(null);


  if (questions.length === 0) {
    return (
      <Card className="my-6 border-dashed p-8 text-center">
        <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <CardTitle className="text-base">Nu sunt întrebări disponibile</CardTitle>
        <CardDescription className="text-xs">
          Întrebările pentru acest test vor fi populate automat din baza de date.
        </CardDescription>
      </Card>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIdx,
    }));
  };

  const getCorrectIndex = (q: McqQuestion): number => {
    if (typeof q.correct_index === "number") return q.correct_index;
    if (typeof q.correct_answer === "number") return q.correct_answer;
    if (typeof q.correct_answer === "string") {
      const idx = q.options.findIndex((opt) => {
        const text = typeof opt === "string" ? opt : opt.text;
        return text.trim() === (q.correct_answer as string).trim();
      });
      if (idx !== -1) return idx;
    }
    return 0;
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const target = getCorrectIndex(q);
      if (selected === target) {
        correct++;
      }
    });
    const percentage = Math.round((correct / questions.length) * 100);
    return { correct, total: questions.length, percentage };
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    const { percentage } = calculateScore();
    const result = await recordProgress(
      block.lesson_id,
      percentage,
      percentage >= passingScore ? "completed" : "in_progress"
    );

    if (result.savedToCloud) {
      setSyncStatus("Rezultat sincronizat cu profilul tău.");
    } else {
      setSyncStatus("Rezultat salvat local. Autentifică-te pentru a-l salva în profil.");
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIndex(0);
    setSyncStatus(null);
  };

  const { correct, total, percentage } = calculateScore();
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPct = Math.round((answeredCount / total) * 100);
  const isPassed = percentage >= passingScore;

  return (
    <Card className="my-8 border shadow-md overflow-hidden">
      {/* Quiz Header */}
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <Badge variant="outline" className="text-xs">
            Test Interactiv • {total} {total === 1 ? "întrebare" : "întrebări"}
          </Badge>
          {!isSubmitted && (
            <span className="text-xs text-muted-foreground font-medium">
              Întrebarea {currentIndex + 1} din {total}
            </span>
          )}
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        {!isSubmitted && (
          <div className="mt-3 space-y-1.5">
            <Progress value={progressPct} className="h-1.5" />
            <div className="text-[11px] text-muted-foreground text-right">
              {answeredCount} din {total} completate
            </div>
          </div>
        )}
      </CardHeader>

      {/* Main Content Area */}
      <CardContent className="p-6">
        {!isSubmitted ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Cerință
              </span>
              <h3 className="text-lg font-medium leading-snug text-foreground">
                {currentQ.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="grid gap-3">
              {currentQ.options.map((opt, optIdx) => {
                const optText = typeof opt === "string" ? opt : opt.text;
                const isSelected = selectedAnswers[currentIndex] === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelect(optIdx)}
                    className={cn(
                      "flex items-start text-left gap-3.5 p-4 rounded-xl border transition-all cursor-pointer select-none",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold mt-0.5",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40 text-muted-foreground"
                      )}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="text-sm sm:text-base leading-relaxed text-foreground">
                      {optText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border text-center space-y-3 bg-muted/20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  Scor obținut: {correct} / {total} ({percentage}%)
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Punctaj minim de promovare: {passingScore}%
                </p>
              </div>

              <div className="pt-2">
                <Badge
                  variant={isPassed ? "default" : "destructive"}
                  className="px-3 py-1 text-xs sm:text-sm font-semibold"
                >
                  {isPassed ? "Test Promovat cu Succes" : "Necesită Recapitulare"}
                </Badge>
              </div>

              {syncStatus && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-2">
                  <CloudCheck className="h-3.5 w-3.5 text-primary" />
                  <span>{syncStatus}</span>
                </div>
              )}
            </div>

            {/* Questions Review Breakdown */}
            <div className="space-y-4 pt-4">
              <h4 className="font-bold text-base">Revizuire Răspunsuri</h4>
              <div className="divide-y border rounded-xl overflow-hidden">
                {questions.map((q, qIdx) => {
                  const selected = selectedAnswers[qIdx];
                  const correctIdx = getCorrectIndex(q);
                  const isQCorrect = selected === correctIdx;

                  return (
                    <div key={qIdx} className="p-4 sm:p-5 space-y-3 bg-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {isQCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground">
                              Întrebarea {qIdx + 1}
                            </span>
                            <p className="text-sm sm:text-base font-medium text-foreground">
                              {q.question}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pl-7 space-y-1 text-xs sm:text-sm">
                        <div className="text-muted-foreground">
                          Răspunsul tău:{" "}
                          <span
                            className={cn(
                              "font-medium",
                              isQCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                            )}
                          >
                            {selected !== undefined
                              ? typeof q.options[selected] === "string"
                                ? (q.options[selected] as string)
                                : (q.options[selected] as { text: string }).text
                              : "Neselectat"}
                          </span>
                        </div>
                        {!isQCorrect && (
                          <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Răspuns corect:{" "}
                            {typeof q.options[correctIdx] === "string"
                              ? (q.options[correctIdx] as string)
                              : (q.options[correctIdx] as { text: string }).text}
                          </div>
                        )}
                        {q.explanation && (
                          <div className="pt-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                            <span className="font-semibold text-foreground">Explicație: </span>
                            {q.explanation}
                          </div>
                        )}
                        {q.citation && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <BookMarked className="h-3 w-3" />
                            <span>Referință: {q.citation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Quiz Footer Controls */}
      <CardFooter className="border-t bg-muted/10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        {!isSubmitted ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </Button>

            <div className="flex items-center gap-2">
              {currentIndex < total - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentIndex((prev) => Math.min(total - 1, prev + 1))}
                  className="gap-1.5"
                >
                  <span>Următor</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={answeredCount === 0}
                  className="gap-1.5"
                >
                  <Award className="h-4 w-4" />
                  <span>Finalizează Testul</span>
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="w-full flex justify-end">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="h-4 w-4" />
              <span>Reia Testul</span>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
