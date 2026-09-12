import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookMarked, ExternalLink, Sparkles } from "lucide-react";
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
    <article className="space-y-6 my-4">
      {/* Rich Markdown Rendering */}
      <div className="max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children, ...props }) => (
              <h1
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-8 mb-4 flex items-center gap-3"
                {...props}
              >
                <span className="h-7 w-1.5 rounded-full bg-primary inline-block shrink-0" />
                <span>{children}</span>
              </h1>
            ),
            h2: ({ children, ...props }) => (
              <div className="mt-8 mb-4 border-b border-border/70 pb-2.5">
                <h2
                  className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 group"
                  {...props}
                >
                  <span className="text-primary/70 font-mono text-lg select-none group-hover:text-primary transition-colors">
                    #
                  </span>
                  <span>{children}</span>
                </h2>
              </div>
            ),
            h3: ({ children, ...props }) => (
              <h3
                className="text-lg sm:text-xl font-semibold text-foreground/95 mt-6 mb-3 flex items-center gap-2"
                {...props}
              >
                <span className="w-2 h-2 rounded-full bg-primary/70 inline-block shrink-0" />
                <span>{children}</span>
              </h3>
            ),
            h4: ({ children, ...props }) => (
              <h4
                className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-5 mb-2"
                {...props}
              >
                {children}
              </h4>
            ),
            p: ({ children, ...props }) => (
              <p
                className="text-[15px] sm:text-base leading-relaxed text-foreground/85 my-3.5"
                {...props}
              >
                {children}
              </p>
            ),
            strong: ({ children, ...props }) => (
              <strong
                className="font-semibold text-foreground bg-primary/8 dark:bg-primary/20 px-1.5 py-0.5 rounded text-[0.95em]"
                {...props}
              >
                {children}
              </strong>
            ),
            em: ({ children, ...props }) => (
              <em className="italic text-foreground/90 font-medium" {...props}>
                {children}
              </em>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote
                className="my-5 rounded-r-xl border-l-4 border-primary bg-primary/5 dark:bg-primary/10 px-5 py-4 text-foreground/90 italic shadow-xs"
                {...props}
              >
                {children}
              </blockquote>
            ),
            ul: ({ children, ...props }) => (
              <ul className="my-4 space-y-2 pl-2" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol
                className="my-4 space-y-2 list-decimal list-outside pl-6 text-foreground/90 marker:font-semibold marker:text-primary"
                {...props}
              >
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li
                className="text-[15px] sm:text-base leading-relaxed text-foreground/85 pl-1"
                {...props}
              >
                {children}
              </li>
            ),
            table: ({ children, ...props }) => (
              <div className="my-6 w-full overflow-x-auto rounded-xl border border-border/80 bg-card shadow-xs">
                <table className="w-full text-sm text-left border-collapse" {...props}>
                  {children}
                </table>
              </div>
            ),
            thead: ({ children, ...props }) => (
              <thead
                className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/80 font-semibold"
                {...props}
              >
                {children}
              </thead>
            ),
            th: ({ children, ...props }) => (
              <th className="px-4 py-3 font-semibold text-foreground/90" {...props}>
                {children}
              </th>
            ),
            tbody: ({ children, ...props }) => (
              <tbody className="divide-y divide-border/60" {...props}>
                {children}
              </tbody>
            ),
            tr: ({ children, ...props }) => (
              <tr
                className="hover:bg-muted/40 transition-colors even:bg-muted/20"
                {...props}
              >
                {children}
              </tr>
            ),
            td: ({ children, ...props }) => (
              <td className="px-4 py-3 text-foreground/80 leading-normal" {...props}>
                {children}
              </td>
            ),
            code: ({ inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || "");
              return inline !== false && !match ? (
                <code
                  className="rounded bg-muted/90 px-1.5 py-0.5 font-mono text-[13px] text-primary font-medium border border-border/60"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <div className="my-4 rounded-xl border border-border/80 bg-muted/40 p-4 font-mono text-xs overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </div>
              );
            },
            hr: ({ ...props }) => (
              <hr
                className="my-8 border-none h-px bg-gradient-to-r from-transparent via-border to-transparent"
                {...props}
              />
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>

      {/* Citations Box if attached */}
      {citations.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-card p-4 sm:p-5 space-y-3 text-xs shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-foreground/90 uppercase tracking-wider text-[11px]">
              <BookMarked className="h-3.5 w-3.5 text-primary" />
              <span>Temei Legal & Referințe Bibliografice</span>
            </div>
            <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary">
              <Sparkles className="h-2.5 w-2.5" />
              <span>Sursă Oficială</span>
            </Badge>
          </div>

          <div className="divide-y border rounded-lg bg-muted/20 overflow-hidden">
            {citations.map((c, idx) => (
              <div
                key={idx}
                className="p-3 flex flex-wrap items-center justify-between gap-2 text-xs hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {c.locator && (
                    <Badge variant="secondary" className="font-mono text-[11px] font-medium">
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
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-[11px] shrink-0 font-medium hover:underline"
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
    </article>
  );
}

