"use client";

import * as React from "react";
import { CheckCircle2, Circle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleLessonComplete } from "@/app/actions/progress";
import { cn } from "@/lib/utils";

interface LessonProgressButtonProps {
  lessonId: string;
  initialStatus?: string | null;
  initialScore?: number | null;
  className?: string;
}

export function LessonProgressButton({
  lessonId,
  initialStatus,
  initialScore,
  className,
}: LessonProgressButtonProps) {
  const [status, setStatus] = React.useState<string>(initialStatus || "not_started");
  const [isPending, startTransition] = React.useTransition();
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  const isCompleted = status === "completed";

  const handleToggle = () => {
    const nextStatus = isCompleted ? "in_progress" : "completed";
    setStatus(nextStatus);
    setFeedbackMessage(null);

    startTransition(async () => {
      const res = await toggleLessonComplete(lessonId, nextStatus);
      if (!res.savedToCloud) {
        if (res.error) {
          setFeedbackMessage(res.error);
        }
        // Rollback if unauthenticated or error
        if (!res.success) {
          setStatus(status);
        }
      } else {
        setFeedbackMessage(
          nextStatus === "completed" ? "Lecție marcată ca finalizată!" : "Lecție marcată ca în lucru."
        );
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    });
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center gap-2", className)}>
      <Button
        variant={isCompleted ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "gap-2 transition-all select-none cursor-pointer",
          isCompleted && "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
        )}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-white" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="font-medium text-xs sm:text-sm">
          {isCompleted ? "Lecție Finalizată" : "Marchează ca Finalizat"}
        </span>
      </Button>

      {typeof initialScore === "number" && (
        <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-md">
          Scor: {initialScore}%
        </span>
      )}

      {feedbackMessage && (
        <span className="text-xs text-muted-foreground flex items-center gap-1 animate-fade-in">
          <Sparkles className="h-3 w-3 text-primary shrink-0" />
          <span>{feedbackMessage}</span>
        </span>
      )}
    </div>
  );
}
