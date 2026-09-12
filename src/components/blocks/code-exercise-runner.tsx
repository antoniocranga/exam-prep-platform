"use client";

import * as React from "react";
import {
  Code2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  CloudCheck,
} from "lucide-react";
import { LessonBlockRow } from "@/types/database.types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { recordProgress } from "@/app/actions/progress";
import { cn } from "@/lib/utils";

interface CheckRule {
  id?: string | number;
  name?: string;
  description?: string;
  type?: "contains" | "regex" | "exact" | "eval";
  pattern?: string;
  expected?: string;
  target?: string;
  hint?: string;
}

interface CodeExerciseContent {
  title?: string;
  prompt?: string;
  instructions?: string;
  description?: string;
  language?: string;
  starter_code?: string;
  initial_code?: string;
  template?: string;
  solution?: string;
  checks?: CheckRule[];
  test_cases?: CheckRule[];
  expected_checks?: CheckRule[];
}

interface CheckResult {
  rule: CheckRule;
  passed: boolean;
  message: string;
}

export function CodeExerciseRunner({ block }: { block: LessonBlockRow }) {
  const content = (block.content_json || {}) as CodeExerciseContent;
  const title = content.title || "Exercițiu Practic / Simulare";
  const prompt = content.prompt || content.instructions || content.description || "";
  const language = (content.language || "javascript").toLowerCase();
  const starterCode =
    content.starter_code ?? content.initial_code ?? content.template ?? "";
  const rawChecks =
    content.checks ?? content.test_cases ?? content.expected_checks ?? [];

  const [code, setCode] = React.useState(starterCode);
  const [copied, setCopied] = React.useState(false);
  const [isRunning, setIsRunning] = React.useState(false);
  const [results, setResults] = React.useState<CheckResult[] | null>(null);
  const [syncStatus, setSyncStatus] = React.useState<string | null>(null);

  // Sync state when block updates
  React.useEffect(() => {
    setCode(starterCode);
    setResults(null);
    setSyncStatus(null);
  }, [starterCode]);

  // Copy code handler
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset to initial code
  const handleReset = () => {
    setCode(starterCode);
    setResults(null);
    setSyncStatus(null);
  };

  // Allow Tab key indent in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = code.substring(0, start) + "  " + code.substring(end);
      setCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Generic client-side evaluation against declared check rules
  const runEvaluation = async () => {
    setIsRunning(true);
    setSyncStatus(null);

    // Simulate processing time for realistic feel
    await new Promise((r) => setTimeout(r, 400));

    const checkResults: CheckResult[] = rawChecks.map((rule, idx) => {
      const ruleName = rule.name || rule.description || `Verificare #${idx + 1}`;
      const type = rule.type || "contains";
      const target = rule.pattern || rule.expected || rule.target || "";

      let passed = false;
      let message = "";

      try {
        if (type === "contains") {
          passed = code.toLowerCase().includes(target.toLowerCase());
          message = passed
            ? `Regula este respectată.`
            : (rule.hint || `Codul trebuie să conțină "${target}".`);
        } else if (type === "regex") {
          const regex = new RegExp(target, "i");
          passed = regex.test(code);
          message = passed
            ? `Tiparul este validat.`
            : (rule.hint || `Tiparul așteptat nu a fost identificat.`);
        } else if (type === "exact") {
          passed = code.trim() === target.trim();
          message = passed
            ? `Codul coincide cu cerința.`
            : (rule.hint || `Răspunsul nu corespunde exact.`);
        } else if (type === "eval") {
          // Safe evaluation if target function or pattern exists
          const regex = new RegExp(target, "i");
          passed = regex.test(code);
          message = passed
            ? `Verificare logică trecută.`
            : (rule.hint || `Soluția logică necesită revizuire.`);
        } else {
          // Default fallback to text inclusion
          passed = code.includes(target);
          message = passed ? `Verificare validată.` : (rule.hint || `Condiție neîndeplinită.`);
        }
      } catch (err) {
        passed = false;
        message = `Eroare la verificare: ${err instanceof Error ? err.message : String(err)}`;
      }

      return {
        rule: { ...rule, name: ruleName },
        passed,
        message,
      };
    });

    setResults(checkResults);
    setIsRunning(false);

    // Score calculation
    const passedCount = checkResults.filter((r) => r.passed).length;
    const totalCount = checkResults.length || 1;
    const scorePct = Math.round((passedCount / totalCount) * 100);

    const progressResult = await recordProgress(
      block.lesson_id,
      scorePct,
      scorePct === 100 ? "completed" : "in_progress"
    );

    if (progressResult.savedToCloud) {
      setSyncStatus("Rezultat sincronizat cu profilul.");
    } else {
      setSyncStatus("Rezultat salvat local.");
    }
  };

  const lineCount = code.split("\n").length;
  const passedCount = results ? results.filter((r) => r.passed).length : 0;
  const totalChecks = results ? results.length : rawChecks.length;
  const isAllPassed = results ? passedCount === totalChecks && totalChecks > 0 : false;

  return (
    <Card className="my-8 border shadow-md overflow-hidden">
      {/* Header */}
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              <Code2 className="h-3 w-3 mr-1" />
              {language}
            </Badge>
            {rawChecks.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {rawChecks.length} Verificări automate
              </Badge>
            )}
          </div>
          {results && (
            <span className="text-xs text-muted-foreground font-medium">
              {passedCount} din {totalChecks} trecute
            </span>
          )}
        </div>

        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        {prompt && (
          <CardDescription className="text-sm leading-relaxed whitespace-pre-line text-foreground/80 mt-1">
            {prompt}
          </CardDescription>
        )}

        {results && (
          <div className="mt-3 space-y-1.5">
            <Progress
              value={totalChecks > 0 ? (passedCount / totalChecks) * 100 : 0}
              className="h-1.5"
            />
          </div>
        )}
      </CardHeader>

      {/* Editor Content Area */}
      <CardContent className="p-0">
        <div className="bg-zinc-950 text-zinc-100 dark:bg-zinc-950/80">
          {/* Editor Sub-header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70 inline-block" />
              <span className="ml-2 font-mono text-[11px]">solutie.{language === "javascript" ? "js" : language === "typescript" ? "ts" : language === "python" ? "py" : "txt"}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Copiază codul"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Resetează la șablonul inițial"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Editor Body with Line Numbers */}
          <div className="flex font-mono text-xs sm:text-sm min-h-[220px] max-h-[480px] overflow-auto">
            <div className="py-3 px-2 text-right select-none text-zinc-600 bg-zinc-900/50 border-r border-zinc-800/80 min-w-[2.5rem]">
              {Array.from({ length: Math.max(lineCount, 6) }).map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="w-full py-3 px-4 bg-transparent text-zinc-100 leading-6 resize-none outline-none font-mono focus:ring-0 whitespace-pre"
              rows={Math.max(lineCount, 6)}
              placeholder="Scrie sau completează soluția aici..."
            />
          </div>
        </div>

        {/* Validation Checks Results */}
        {results && (
          <div className="p-5 border-t bg-muted/20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                {isAllPassed ? (
                  <>
                    <Award className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Toate verificările au trecut cu succes!
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Rezultate Verificare</span>
                  </>
                )}
              </h4>
              {syncStatus && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CloudCheck className="h-3.5 w-3.5 text-primary" />
                  {syncStatus}
                </span>
              )}
            </div>

            <div className="divide-y border rounded-xl overflow-hidden bg-card">
              {results.map((r, idx) => (
                <div key={idx} className="p-3.5 flex items-start gap-3 text-xs sm:text-sm">
                  {r.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="font-medium text-foreground">{r.rule.name}</div>
                    <div
                      className={cn(
                        "text-xs",
                        r.passed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                      )}
                    >
                      {r.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer Controls */}
      <CardFooter className="border-t bg-muted/10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Resetează Codul</span>
        </Button>

        <Button
          size="sm"
          onClick={runEvaluation}
          disabled={isRunning}
          className="gap-1.5"
        >
          <Play className="h-3.5 w-3.5" />
          <span>{isRunning ? "Se verifică..." : "Rulează și Validează"}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
