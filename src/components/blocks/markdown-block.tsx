import * as React from "react";
import ReactMarkdown from "react-markdown";
import { LessonBlockRow } from "@/types/database.types";

interface MarkdownBlockProps {
  block: LessonBlockRow;
}

export function MarkdownBlock({ block }: MarkdownBlockProps) {
  const content = block.content_json;
  let markdown = "";

  if (typeof content === "string") {
    markdown = content;
  } else if (content && typeof content === "object" && !Array.isArray(content)) {
    markdown = String(content.markdown || content.text || content.body || content.content || "");
  }

  return (
    <div className="prose dark:prose-invert max-w-none my-6 leading-relaxed">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
