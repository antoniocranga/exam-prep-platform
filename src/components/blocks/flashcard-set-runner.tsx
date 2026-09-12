"use client";

import * as React from "react";
import {
  Layers,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BookMarked,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { LessonBlockRow } from "@/types/database.types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FlashcardRawItem {
  id?: string | number;
  front?: string;
  back?: string;
  term?: string;
  definition?: string;
  question?: string;
  answer?: string;
  explanation?: string;
  citation?: string;
  reference?: string;
  tag?: string;
  category?: string;
}

interface FlashcardSetContent {
  title?: string;
  description?: string;
  cards?: FlashcardRawItem[];
}

interface NormalizedCard {
  id: string;
  front: string;
  back: string;
  citation?: string;
  tag?: string;
  originalIndex: number;
}

export function FlashcardSetRunner({ block }: { block: LessonBlockRow }) {
  const content = (block.content_json || {}) as FlashcardSetContent;
  const rawCards = Array.isArray(content.cards) ? content.cards : [];
  const title = content.title || "Set Flashcarduri Recapitulare";
  const description =
    content.description || "Memorare activă prin repetare spațiată și autoevaluare.";

  // Normalize card data from any schema variation
  const initialCards: NormalizedCard[] = React.useMemo(() => {
    return rawCards.map((c, idx) => ({
      id: String(c.id ?? idx),
      front: c.front || c.term || c.question || `Concept #${idx + 1}`,
      back: c.back || c.definition || c.answer || c.explanation || "Nicio definiție furnizată.",
      citation: c.citation || c.reference,
      tag: c.tag || c.category,
      originalIndex: idx,
    }));
  }, [rawCards]);

  const [cards, setCards] = React.useState<NormalizedCard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isShuffled, setIsShuffled] = React.useState(false);

  // Self-assessment tracking: maps card id to 'mastered' or 'learning'
  const [ratings, setRatings] = React.useState<Record<string, "mastered" | "learning">>({});
  const [showSummary, setShowSummary] = React.useState(false);

  // Sync if block prop changes
  React.useEffect(() => {
    setCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(false);
    setRatings({});
    setShowSummary(false);
  }, [initialCards]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, cards.length, showSummary]);

  if (cards.length === 0) {
    return (
      <Card className="my-6 border-dashed p-8 text-center">
        <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <CardTitle className="text-base">Nu sunt flashcarduri disponibile</CardTitle>
        <CardDescription className="text-xs">
          Cardurile pentru această secțiune vor fi populate din baza de date.
        </CardDescription>
      </Card>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPct = Math.round(((currentIndex + 1) / cards.length) * 100);

  const masteredCount = Object.values(ratings).filter((r) => r === "mastered").length;
  const learningCount = Object.values(ratings).filter((r) => r === "learning").length;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRate = (rating: "mastered" | "learning") => {
    if (!currentCard) return;
    setRatings((prev) => ({
      ...prev,
      [currentCard.id]: rating,
    }));
    handleNext();
  };

  const toggleShuffle = () => {
    if (isShuffled) {
      // Restore original order
      const restored = [...initialCards];
      setCards(restored);
      setIsShuffled(false);
    } else {
      // Fisher-Yates shuffle
      const shuffled = [...cards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setCards(shuffled);
      setIsShuffled(true);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRestartAll = () => {
    setCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(false);
    setRatings({});
    setShowSummary(false);
  };

  const handlePracticeUnmastered = () => {
    const unmastered = initialCards.filter((c) => ratings[c.id] !== "mastered");
    if (unmastered.length > 0) {
      setCards(unmastered);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowSummary(false);
    } else {
      handleRestartAll();
    }
  };

  return (
    <Card className="my-8 border shadow-md overflow-hidden">
      {/* Header */}
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Layers className="h-3 w-3 mr-1" />
              Flashcarduri • {cards.length} {cards.length === 1 ? "card" : "carduri"}
            </Badge>
            {isShuffled && (
              <Badge variant="secondary" className="text-[11px]">
                Amestecat
              </Badge>
            )}
          </div>
          {!showSummary && (
            <span className="text-xs text-muted-foreground font-medium">
              Cardul {currentIndex + 1} din {cards.length}
            </span>
          )}
        </div>

        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>

        {!showSummary && (
          <div className="mt-3 space-y-1.5">
            <Progress value={progressPct} className="h-1.5" />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{Math.round(progressPct)}% parcurs</span>
              <span>
                {masteredCount} știute • {learningCount} în revizuire
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      {/* Main Flashcard Body */}
      <CardContent className="p-6">
        {!showSummary ? (
          <div className="space-y-6">
            {/* 3D Flip Card Container */}
            <div
              className="relative w-full min-h-[260px] sm:min-h-[300px] cursor-pointer select-none [perspective:1000px]"
              onClick={handleFlip}
              role="button"
              tabIndex={0}
              aria-label="Apasă pentru a întoarce cardul"
            >
              <div
                className={cn(
                  "relative w-full h-full min-h-[260px] sm:min-h-[300px] rounded-2xl border transition-all duration-500 shadow-sm",
                  "[transform-style:preserve-3d]",
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                )}
              >
                {/* Front Side */}
                <div
                  className={cn(
                    "absolute inset-0 w-full h-full p-6 sm:p-8 rounded-2xl flex flex-col justify-between",
                    "bg-gradient-to-br from-card via-card to-muted/30",
                    "[backface-visibility:hidden]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Față • Concept / Întrebare
                    </span>
                    {currentCard.tag && (
                      <Badge variant="secondary" className="text-[11px]">
                        {currentCard.tag}
                      </Badge>
                    )}
                  </div>

                  <div className="my-auto py-4 text-center">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {currentCard.front}
                    </h3>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <RotateCw className="h-3.5 w-3.5 animate-spin-slow" />
                    <span>Apasă pentru a vedea definiția / răspunsul (sau Space)</span>
                  </div>
                </div>

                {/* Back Side */}
                <div
                  className={cn(
                    "absolute inset-0 w-full h-full p-6 sm:p-8 rounded-2xl flex flex-col justify-between",
                    "bg-gradient-to-br from-primary/5 via-card to-card border-primary/20",
                    "[transform:rotateY(180deg)] [backface-visibility:hidden]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Verso • Explicație / Definiție
                    </span>
                    <Badge variant="outline" className="text-[11px] text-muted-foreground">
                      Soluție
                    </Badge>
                  </div>

                  <div className="my-auto py-3 space-y-3">
                    <p className="text-base sm:text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                      {currentCard.back}
                    </p>
                    {currentCard.citation && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/40">
                        <BookMarked className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>Sursă: {currentCard.citation}</span>
                      </div>
                    )}
                  </div>

                  {/* Active Recall Action Buttons */}
                  <div
                    className="pt-3 border-t flex flex-wrap items-center justify-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "gap-1.5 border-destructive/40 hover:bg-destructive/10 text-destructive text-xs",
                        ratings[currentCard.id] === "learning" && "bg-destructive/15 border-destructive font-semibold"
                      )}
                      onClick={() => handleRate("learning")}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Încă învăț</span>
                    </Button>
                    <Button
                      size="sm"
                      className={cn(
                        "gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs",
                        ratings[currentCard.id] === "mastered" && "ring-2 ring-emerald-400 font-semibold"
                      )}
                      onClick={() => handleRate("mastered")}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Știu acest concept</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Summary Screen */
          <div className="p-6 rounded-2xl border text-center space-y-5 bg-muted/20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Felicitări! Ai parcurs setul.</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ai recapitulat toate cele {cards.length} flashcarduri din această secțiune.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
              <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                <div className="text-2xl font-bold">{masteredCount}</div>
                <div className="text-xs font-medium">Concepte stăpânite</div>
              </div>
              <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400">
                <div className="text-2xl font-bold">{learningCount}</div>
                <div className="text-xs font-medium">De aprofundat</div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" size="sm" onClick={handleRestartAll} className="gap-1.5">
                <RotateCcw className="h-4 w-4" />
                <span>Reia toate ({initialCards.length})</span>
              </Button>
              {initialCards.length - masteredCount > 0 && (
                <Button size="sm" onClick={handlePracticeUnmastered} className="gap-1.5">
                  <Layers className="h-4 w-4" />
                  <span>Exersează neînvățate ({initialCards.length - masteredCount})</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer Navigation Controls */}
      {!showSummary && (
        <CardFooter className="border-t bg-muted/10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShuffle}
              className={cn("gap-1.5 text-xs", isShuffled && "text-primary font-semibold")}
              title={isShuffled ? "Resetează ordinea originală" : "Amestecă cardurile"}
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>{isShuffled ? "Ordonat" : "Amestecă"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFlip}
              className="gap-1.5"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Întoarce</span>
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1.5"
            >
              <span>{currentIndex === cards.length - 1 ? "Finalizează" : "Următor"}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
