"use client";

import * as React from "react";
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { LessonBlockRow } from "@/types/database.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuizOpenBlockProps {
  block: LessonBlockRow;
}

export function QuizOpenBlock({ block }: QuizOpenBlockProps) {
  const content = (block.content_json || {}) as Record<string, unknown>;
  const question = (content.question || content.prompt || "") as string;
  const sampleAnswer = (content.sample_answer || content.rubric || content.model_answer || "") as string;
  const citation = (content.citation || content.source || "") as string;

  const [response, setResponse] = React.useState("");
  const [showAnswer, setShowAnswer] = React.useState(false);

  return (
    <Card className="my-6 border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Întrebare cu Răspuns Deschis
          </span>
          {citation && (
            <span className="text-xs text-muted-foreground font-mono">
              {citation}
            </span>
          )}
        </div>
        <CardTitle className="text-base sm:text-lg font-bold leading-snug">
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Scrieți argumentul sau sinteza dvs. aici..."
            rows={4}
            className="w-full rounded-lg border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAnswer(!showAnswer)}
            className="gap-1.5"
          >
            <HelpCircle className="h-4 w-4" />
            <span>{showAnswer ? "Ascunde baremul" : "Vezi baremul orientativ"}</span>
            {showAnswer ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {showAnswer && sampleAnswer && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm leading-relaxed animate-in fade-in-50">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Răspuns model / Barem de evaluare:</span>
            </div>
            <p className="text-muted-foreground whitespace-pre-line">{sampleAnswer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
