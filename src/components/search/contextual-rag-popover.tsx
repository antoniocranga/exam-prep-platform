"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  ExternalLink,
  Copy,
  Check,
  X,
  ArrowUpRight,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { performRagSearchAction } from "@/app/actions/search-actions";
import { RagSearchResult } from "@/lib/search/rag-search";
import { cn } from "@/lib/utils";

export interface ContextualRagProps {
  children: React.ReactNode;
  className?: string;
}

const CATEGORY_TABS = [
  { id: "all", label: "Toate" },
  { id: "legea-198", label: "Legea 198" },
  { id: "rofuip", label: "ROFUIP" },
  { id: "ome-3934", label: "OME 3934" },
  { id: "teorie", label: "Teorie" },
  { id: "spete", label: "Spețe" },
];

export function ContextualRagContainer({ children, className }: ContextualRagProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Floating popover state
  const [selectedText, setSelectedText] = React.useState("");
  const [popoverPos, setPopoverPos] = React.useState<{ top: number; left: number } | null>(null);
  const [isPopoverVisible, setIsPopoverVisible] = React.useState(false);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [results, setResults] = React.useState<RagSearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Handle text selection within container
  const updateSelection = React.useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setIsPopoverVisible(false);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 3) {
      setIsPopoverVisible(false);
      return;
    }

    // Check if selection is within our container
    const range = selection.getRangeAt(0);
    const container = containerRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) {
      setIsPopoverVisible(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setIsPopoverVisible(false);
      return;
    }

    setSelectedText(text);
    setPopoverPos({
      top: rect.top + window.scrollY - 46,
      left: rect.left + window.scrollX + rect.width / 2,
    });
    setIsPopoverVisible(true);
  }, []);

  React.useEffect(() => {
    const onMouseUp = () => {
      setTimeout(updateSelection, 10);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPopoverVisible(false);
      } else {
        setTimeout(updateSelection, 10);
      }
    };

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [updateSelection]);

  // Execute search when query or category changes
  React.useEffect(() => {
    const queryToSearch = searchQuery.trim();
    if (!queryToSearch || !isDrawerOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await performRagSearchAction(queryToSearch, activeCategory, 20);
        setResults(res.results || []);
      } catch (err) {
        console.error("Contextual RAG lookup error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, isDrawerOpen]);

  // Trigger RAG lookup from floating button
  const handleOpenRag = () => {
    if (!selectedText) return;
    setSearchQuery(selectedText);
    setIsPopoverVisible(false);
    setIsDrawerOpen(true);
  };

  const handleCopyCitation = (result: RagSearchResult) => {
    const textToCopy = `${result.citation} — ${result.locator}${result.source_url ? ` (${result.source_url})` : ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(result.result_id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === result.result_id ? null : curr));
    }, 2000);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {children}

      {/* Floating Action Tooltip */}
      {isPopoverVisible && popoverPos && (
        <div
          style={{
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            transform: "translateX(-50%)",
          }}
          className="fixed z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-foreground text-background dark:bg-card dark:text-foreground shadow-xl border border-border/80 ring-1 ring-black/10 dark:ring-white/10 backdrop-blur-md">
            <Button
              type="button"
              size="sm"
              onClick={handleOpenRag}
              className="h-8 px-3.5 gap-2 rounded-full font-semibold text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>Caută în Legislație (RAG)</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsPopoverVisible(false)}
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Închide"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Slide-over Drawer for Contextual RAG results */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg md:max-w-xl p-0 flex flex-col h-full bg-background border-l border-border/80 shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/70 bg-muted/20 space-y-3">
            <SheetHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <SheetTitle className="text-base sm:text-lg font-extrabold tracking-tight">
                  Căutare Contextuală RAG
                </SheetTitle>
              </div>
              <SheetDescription className="text-xs text-muted-foreground">
                Articole corelate, referințe normative și spețe practice din legislația școlară
              </SheetDescription>
            </SheetHeader>

            {/* Current highlighted phrase */}
            <div className="flex items-start gap-2 bg-card p-2.5 rounded-xl border border-border/60 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground shrink-0">Text selectat:</span>
              <span className="italic line-clamp-2 text-foreground/90">
                &ldquo;{selectedText}&rdquo;
              </span>
            </div>

            {/* Editable query input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rafinează căutarea sau introdu cuvinte cheie..."
                className="pl-9 pr-8 h-9 text-xs rounded-xl bg-background border-border/80"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-primary" />
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border select-none cursor-pointer",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background text-muted-foreground border-border/70 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-border/60 space-y-2.5 bg-card">
                    <div className="flex gap-2">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded-full" />
                      <div className="h-4 w-16 bg-muted animate-pulse rounded-full" />
                    </div>
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-12 w-full bg-muted/60 animate-pulse rounded-lg" />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                  <span>
                    {results.length} prevederi și spețe corelate
                  </span>
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery)}&filter=${activeCategory}`}
                    className="text-primary hover:underline flex items-center gap-0.5"
                    target="_blank"
                  >
                    <span>Deschide în Hub-ul complet</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>

                {results.map((r) => {
                  const isCopied = copiedId === r.result_id;
                  const hasLessonLink = Boolean(r.lesson_slug && r.module_slug);
                  const lessonUrl = hasLessonLink
                    ? `/modules/${r.module_slug}/${r.lesson_slug}${r.block_id ? `#block-${r.block_id}` : ""}`
                    : null;

                  return (
                    <Card
                      key={r.result_id}
                      className="border-border/70 bg-card hover:border-primary/40 transition-colors duration-150 text-xs"
                    >
                      <CardContent className="p-3.5 sm:p-4 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                                r.source_category === "legea-198" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
                                r.source_category === "rofuip" && "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
                                r.source_category === "ome-3934" && "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
                                r.source_category === "teorie" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
                                r.source_category === "spete" && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              )}
                            >
                              {r.source_badge_label}
                            </Badge>

                            {r.locator && (
                              <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                                {r.locator}
                              </Badge>
                            )}
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCitation(r)}
                            className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                            title="Copiază citarea"
                          >
                            {isCopied ? (
                              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                                <Check className="h-3 w-3" /> Copiat
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Copy className="h-3 w-3" /> Citare
                              </span>
                            )}
                          </Button>
                        </div>

                        <h4 className="font-bold text-foreground text-sm leading-snug">
                          {r.title}
                        </h4>

                        <div
                          className="text-muted-foreground leading-relaxed bg-muted/40 p-2.5 rounded-lg border border-border/40 text-xs"
                          dangerouslySetInnerHTML={{ __html: r.highlighted_snippet || r.snippet }}
                        />

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/50">
                          <span className="truncate max-w-[240px]" title={r.citation}>
                            {r.citation}
                          </span>

                          <div className="flex items-center gap-2">
                            {r.source_url && (
                              <a
                                href={r.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <span>Sursă</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}

                            {lessonUrl && (
                              <Link
                                href={lessonUrl}
                                onClick={() => setIsDrawerOpen(false)}
                                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                              >
                                <span>Lecție</span>
                                <ArrowUpRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    Nicio referință găsită
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Încearcă să extinzi selecția de text sau selectează categoria &ldquo;Toate&rdquo;.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 border-t border-border/70 bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <Info className="h-3 w-3" /> Selectează orice text pentru o căutare nouă
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(false)}
              className="h-8 text-xs rounded-xl"
            >
              Închide panoul
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
