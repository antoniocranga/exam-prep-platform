"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Sparkles, BookOpen, Scale, FileText, GraduationCap, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResultsList } from "@/components/search/search-results-list";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { performRagSearchAction } from "@/app/actions/search-actions";
import { RagSearchResult } from "@/lib/search/rag-search";

const FILTER_TABS = [
  { id: "all", label: "Toate sursele", icon: Search },
  { id: "legea-198", label: "Legea 198/2023", icon: Scale },
  { id: "rofuip", label: "ROFUIP", icon: FileText },
  { id: "ome-3934", label: "OME 3934/2026", icon: FileText },
  { id: "teorie", label: "Bush & Hattie (Teorie)", icon: GraduationCap },
  { id: "spete", label: "Spețe & Cazuri", icon: Sparkles },
];

const SUGGESTIONS = [
  "Norma didactică Art. 207",
  "Consiliul de Administrație",
  "Sancțiuni disciplinare",
  "Bush modele colegiale",
  "Hattie feedback",
  "Educație incluzivă",
  "Comisia paritară",
];

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const initialFilter = searchParams.get("filter") || "all";

  const [query, setQuery] = React.useState(initialQuery);
  const [filter, setFilter] = React.useState(initialFilter);
  const [results, setResults] = React.useState<RagSearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(Boolean(initialQuery));
  const [error, setError] = React.useState<string | null>(null);

  // Debounce search
  React.useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const timer = setTimeout(async () => {
      try {
        const res = await performRagSearchAction(trimmed, filter, 30);
        if (res.error) {
          setError(res.error);
        } else {
          setResults(res.results || []);
        }
      } catch (err) {
        setError("A apărut o problemă la conectarea cu motorul de căutare.");
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, filter]);

  // Sync state to URL without full reloads
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (filter !== "all") params.set("filter", filter);

    const newUrl = params.toString() ? `/search?${params.toString()}` : "/search";
    window.history.replaceState(null, "", newUrl);
  }, [query, filter]);

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-10 space-y-8">
      {/* Header section */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/30 rounded-full"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Motor de Căutare RAG</span>
          </Badge>
          <Badge variant="secondary" className="text-xs px-2.5 py-0.5 rounded-full">
            Legislație & Curriculum
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Hub de Căutare & Legislație Școlară
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Interoghează în timp real prevederile din Legea 198/2023, ROFUIP, OME 3934/2026, teoriile
          clasice de management (Bush, Hattie) și spețele aplicate din curriculumul de pregătire.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="space-y-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={() => setResults([])}
          isLoading={isLoading}
          autoFocus={!initialQuery}
          className="max-w-4xl"
        />

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> Sugestii:
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSuggestionClick(s)}
              className="px-2.5 py-1 rounded-full bg-muted/60 hover:bg-primary/15 hover:text-primary transition-all text-muted-foreground border border-border/60 hover:border-primary/30 select-none cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-border/70 pb-3">
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="h-auto p-1 bg-muted/50 rounded-2xl flex flex-wrap gap-1">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs transition-all"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Status Bar */}
      {hasSearched && !isLoading && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <div>
            {results.length > 0 ? (
              <span>
                Am găsit <strong className="text-foreground">{results.length}</strong> rezultate relevante
                {filter !== "all" ? ` în categoria selectată` : ""}
              </span>
            ) : (
              <span>Niciun rezultat pentru termenul căutat</span>
            )}
          </div>
          {results.length > 0 && (
            <span className="text-[11px] font-mono">Indexat live din Supabase</span>
          )}
        </div>
      )}

      {/* Results Area */}
      <div>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-28 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-8 w-28 rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-destructive">Eroare la căutare</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuery(query)}
              className="gap-1.5 rounded-lg"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reîncearcă</span>
            </Button>
          </Card>
        ) : results.length > 0 ? (
          <SearchResultsList results={results} query={query} />
        ) : hasSearched ? (
          <Card className="border-dashed p-10 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Search className="h-6 w-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold text-foreground">Nu am găsit rezultate potrivite</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Verifică dacă sintagma căutată este corectă sau încearcă să schimbi categoria din tab-urile de mai sus (ex: comută pe «Toate sursele»).
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter("all")}
                className="text-xs rounded-xl"
              >
                Resetează filtrele
              </Button>
            </div>
          </Card>
        ) : (
          /* Empty Initial State */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
            <Card className="p-5 border-border/70 bg-card hover:border-primary/30 transition-colors space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Scale className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Legea 198/2023</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Acces direct la articolele normei didactice (Art. 207-208), consiliul de administrație (Art. 18-20) și regimul disciplinar.
              </p>
            </Card>

            <Card className="p-5 border-border/70 bg-card hover:border-primary/30 transition-colors space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Bush & Hattie (Teorie)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Modele de conducere (formal, colegial, politic, simbolic) și principiile învățării vizibile cu mărimea efectului feedback-ului.
              </p>
            </Card>

            <Card className="p-5 border-border/70 bg-card hover:border-primary/30 transition-colors space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Spețe & Rezolvări Practice</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Exemple practice din examenele naționale de directori și profesori titulari, cu bareme de evaluare și temei normativ.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
