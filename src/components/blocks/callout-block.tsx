import * as React from "react";
import { Info, AlertTriangle, Lightbulb, Scale } from "lucide-react";
import { LessonBlockRow } from "@/types/database.types";
import { cn } from "@/lib/utils";

interface CalloutBlockProps {
  block: LessonBlockRow;
}

export function CalloutBlock({ block }: CalloutBlockProps) {
  const content = (block.content_json || {}) as Record<string, unknown>;
  const title = (content.title || content.header || "") as string;
  const message = (content.text || content.message || content.body || "") as string;
  const variant = (content.variant || content.type || "info") as string;

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />,
          container: "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200",
        };
      case "tip":
        return {
          icon: <Lightbulb className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />,
          container: "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200",
        };
      case "law":
      case "legislative":
        return {
          icon: <Scale className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />,
          container: "border-indigo-500/30 bg-indigo-500/10 text-indigo-950 dark:text-indigo-200",
        };
      default:
        return {
          icon: <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />,
          container: "border-blue-500/30 bg-blue-500/10 text-blue-950 dark:text-blue-200",
        };
    }
  };

  const { icon, container } = getVariantStyles();

  return (
    <div className={cn("my-6 flex gap-3 rounded-xl border p-4 sm:p-5", container)}>
      {icon}
      <div className="space-y-1 text-sm sm:text-base leading-relaxed min-w-0">
        {title && <p className="font-semibold text-foreground">{title}</p>}
        <p className="whitespace-pre-line">{message}</p>
      </div>
    </div>
  );
}
