import * as React from "react";
import ReactMarkdown from "react-markdown";
import { BookMarked, ExternalLink } from "lucide-react";
import { LessonBlockRow } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";

interface CitationItem {
  citation: string;
  locator?: string;
  source_url?: string;
  source_title?: string;
}

interface MarkdownContent {
  markdown?: string;
  text?: string;
  body?: string;
  content?: string;
  citations?: CitationItem[];
}

interface MarkdownBlockProps {
  block: LessonBlockRow;
}

export function MarkdownBlock({ block }: MarkdownBlockProps) {
  const content = block.content_json;
  let markdown = "";
  let citations: CitationItem[] = [];

  if (typeof content === "string") {
    markdown = content;
  } else if (content && typeof content === "object" && !Array.isArray(content)) {
    const obj = content as MarkdownContent;
    markdown = String(obj.markdown || obj.text || obj.body || obj.content || "");
    if (Array.isArray(obj.citations)) {
      citations = obj.citations;
    }
  }

  return (
    <div className="space-y-6 my-6">
      <div className="prose dark:prose-invert max-w-none leading-relaxed prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>

      {/* Citations Box if attached */}
      {citations.length > 0 && (
        <div className="rounded-xl border bg-muted/30 p-4 sm:p-5 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground/80 uppercase tracking-wider text-[11px]">
            <BookMarked className="h-3.5 w-3.5 text-primary" />
            <span>Temei Legal & Referințe Bibliografice</span>
          </div>

          <div className="divide-y border rounded-lg bg-card overflow-hidden">
            {citations.map((c, idx) => (
              <div
                key={idx}
                className="p-3 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {c.locator && (
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {c.locator}
                    </Badge>
                  )}
                  <span className="font-medium text-foreground">{c.citation}</span>
                </div>

                {c.source_url && (
                  <a
                    href={c.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline text-[11px] shrink-0 font-medium"
                  >
                    <span>Text Oficial</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
