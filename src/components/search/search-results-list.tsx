"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, ArrowUpRight, BookOpen, Check, Copy, Sparkles, Scale, GraduationCap, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RagSearchResult } from "@/lib/search/rag-search";
import { cn } from "@/lib/utils";

export interface SearchResultsListProps {
  results: RagSearchResult[];
  query?: string;
  onResultClick?: (result: RagSearchResult) => void;
  className?: string;
}

function getCategoryStyles(category: RagSearchResult["source_category"]) {
  switch (category) {
    case "legea-198":
      return {
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        icon: Scale,
      };
    case "rofuip":
      return {
        badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
        icon: FileText,
      };
    case "ome-3934":
      return {
        badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
        icon: FileText,
      };
    case "teorie":
      return {
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        icon: GraduationCap,
      };
    case "spete":
      return {
        badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
        icon: Sparkles,
      };
    default:
      return {
        badgeClass: "bg-muted text-muted-foreground border-border",
        icon: BookOpen,
      };
  }
}

export function SearchResultsList({
  results,
  onResultClick,
  className,
}: SearchResultsListProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyCitation = (result: RagSearchResult) => {
    const textToCopy = `${result.citation} — ${result.locator}${result.source_url ? ` (${result.source_url})` : ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(result.result_id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === result.result_id ? null : curr));
    }, 2000);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {results.map((item) => {
        const { badgeClass, icon: CategoryIcon } = getCategoryStyles(item.source_category);
        const hasLessonLink = Boolean(item.lesson_slug && item.module_slug);
        const lessonUrl = hasLessonLink
          ? `/modules/${item.module_slug}/${item.lesson_slug}${item.block_id ? `#block-${item.block_id}` : ""}`
          : null;

        const isCopied = copiedId === item.result_id;

        return (
          <Card
            key={item.result_id}
            className="overflow-hidden border-border/70 hover:border-primary/40 hover:shadow-md transition-all duration-200 group bg-card"
          >
            <CardHeader className="p-4 sm:p-5 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border", badgeClass)}
                  >
                    <CategoryIcon className="h-3 w-3" />
                    <span>{item.source_badge_label}</span>
                  </Badge>

                  {item.locator && (
                    <Badge variant="secondary" className="text-xs font-mono px-2 py-0.5 rounded-full">
                      {item.locator}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCitation(item)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground rounded-lg"
                    title="Copiază citarea completă"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500 mr-1" />
                        <span className="text-emerald-500 font-medium">Copiat!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        <span>Citare</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h3>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
              {/* Highlighted context snippet */}
              <div
                className="text-xs sm:text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/40"
                dangerouslySetInnerHTML={{ __html: item.highlighted_snippet || item.snippet }}
              />

              {/* Source & deep navigation actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground max-w-md truncate">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate" title={item.citation}>
                    {item.citation}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.source_url && (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-muted"
                    >
                      <span>Sursa oficială</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {lessonUrl && (
                    <Link href={lessonUrl} onClick={() => onResultClick?.(item)}>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 gap-1 text-xs font-semibold rounded-lg shadow-xs"
                      >
                        <span>Mergi la lecție</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
