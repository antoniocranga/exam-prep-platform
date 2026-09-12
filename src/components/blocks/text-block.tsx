import * as React from "react";
import { LessonBlockRow } from "@/types/database.types";

interface TextBlockProps {
  block: LessonBlockRow;
}

export function TextBlock({ block }: TextBlockProps) {
  const content = block.content_json;
  let text = "";

  if (typeof content === "string") {
    text = content;
  } else if (content && typeof content === "object" && !Array.isArray(content)) {
    text = String(content.text || content.body || content.content || "");
  }

  return (
    <div className="text-base sm:text-lg leading-relaxed text-foreground/90 whitespace-pre-line my-4">
      {text}
    </div>
  );
}
