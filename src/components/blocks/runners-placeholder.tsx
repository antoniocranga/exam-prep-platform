import * as React from "react";
import { HelpCircle, Layers, Code, Play } from "lucide-react";
import { LessonBlockRow } from "@/types/database.types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function QuizMcqPlaceholder({ block }: { block: LessonBlockRow }) {
  const content = (block.content_json || {}) as Record<string, unknown>;
  const rawQuestions = Array.isArray(content.questions) ? content.questions : [];
  const title = (content.title || "Test Grilă Evaluare") as string;

  return (
    <Card className="my-6 border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between mb-1">
          <Badge variant="secondary" className="text-xs">
            {rawQuestions.length} Întrebări
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">quiz_mcq</span>
        </div>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          Exercițiu grilă generat din conținutul curriculei.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-lg bg-muted/40 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <span>Modul de testare grilă interactivă</span>
          <Button size="sm" className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            <span>Începe Testul</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function FlashcardSetPlaceholder({ block }: { block: LessonBlockRow }) {
  const content = (block.content_json || {}) as Record<string, unknown>;
  const rawCards = Array.isArray(content.cards) ? content.cards : [];
  const title = (content.title || "Set Flashcarduri Recapitulare") as string;

  return (
    <Card className="my-6 border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between mb-1">
          <Badge variant="secondary" className="text-xs">
            {rawCards.length} Carduri
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">flashcard_set</span>
        </div>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          Memorare activă prin repetare spațiată.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-lg bg-muted/40 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <span>Set de cartonașe interactive pentru retenție rapidă</span>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span>Deschide Flashcardurile</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function CodeExercisePlaceholder({ block }: { block: LessonBlockRow }) {
  const content = (block.content_json || {}) as Record<string, unknown>;
  const title = (content.title || "Exercițiu Practic / Simulare") as string;
  const prompt = (content.prompt || content.instruction || "") as string;

  return (
    <Card className="my-6 border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between mb-1">
          <Badge variant="secondary" className="text-xs">
            Exercițiu Aplicat
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">code_exercise</span>
        </div>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
        {prompt && <CardDescription>{prompt}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-lg bg-muted/40 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <span>Mediu de execuție și validare automată</span>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            <span>Lansează Exercițiul</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
