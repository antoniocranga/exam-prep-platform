"use client";

import * as React from "react";
import Link from "next/link";
import { MockExamStructure } from "@/lib/exams/mock-exams";
import { saveExamEvaluationAction } from "@/app/actions/exam-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Sliders,
  FileText,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";

interface ExamResultsViewProps {
  exam: MockExamStructure;
}

interface StoredAttempt {
  examId: string;
  examSlug?: string;
  subiectul1Answers?: Record<string, number>;
  subiectul2Text?: string;
  subiectul3Text?: string;
  scoreSubiectul1?: number;
  totalScore?: number;
  timeSpentSeconds?: number;
  timestamp?: number;
}

export function ExamResultsView({ exam }: ExamResultsViewProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [copiedEssay, setCopiedEssay] = React.useState(false);

  // Attempt Data
  const [attempt, setAttempt] = React.useState<StoredAttempt | null>(null);

  // Rubric criteria state for Subiectul III (5 criteria, 0-6p each = max 30p)
  const defaultCriteriaScores = React.useMemo(() => {
    return {
      criteriu_1: 5, // Încadrare normativă & legislație incidentă
      criteriu_2: 5, // Model conducere Tony Bush
      criteriu_3: 5, // Procedură legală & drept la apărare
      criteriu_4: 4, // Măsuri manageriale & climat școlar
      criteriu_5: 5, // Redactare & coerență logică
    };
  }, []);

  const [rubricScoresSub3, setRubricScoresSub3] = React.useState<Record<string, number>>(defaultCriteriaScores);
  const [selfScoreSub2, setSelfScoreSub2] = React.useState<number>(24);

  // Read stored attempt on mount
  React.useEffect(() => {
    setIsMounted(true);
    try {
      const keyById = `simulare_attempt_${exam.id}`;
      const keyBySlug = `simulare_attempt_${exam.slug}`;
      const raw = localStorage.getItem(keyById) || localStorage.getItem(keyBySlug);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredAttempt;
        setAttempt(parsed);
      }
    } catch {
      // ignore
    }
  }, [exam.id, exam.slug]);

  // Subiectul I calculations
  const { sub1Score, sub1CorrectCount, answeredSub1Count } = React.useMemo(() => {
    const answers = attempt?.subiectul1Answers || {};
    let correct = 0;
    let answered = 0;

    exam.subiectul_1.questions.forEach((q) => {
      const userSelected = answers[q.id];
      if (typeof userSelected === "number") {
        answered++;
        if (userSelected === q.correct_option_index) {
          correct++;
        }
      }
    });

    // If user has no attempt recorded yet, provide a benchmark score (e.g. 8/10 correct = 24p)
    if (answered === 0 && !attempt) {
      return { sub1Score: 24, sub1CorrectCount: 8, answeredSub1Count: 10 };
    }

    return {
      sub1Score: correct * 3,
      sub1CorrectCount: correct,
      answeredSub1Count: answered,
    };
  }, [attempt, exam.subiectul_1.questions]);

  // Subiectul III total calculated from the 5 rubric criteria
  const sub3Score = React.useMemo(() => {
    return Object.values(rubricScoresSub3).reduce((acc, curr) => acc + curr, 0);
  }, [rubricScoresSub3]);

  // Total calculated score out of 100
  const totalScore = Math.min(100, sub1Score + selfScoreSub2 + sub3Score + exam.oficiu_points);

  // Format time spent
  const timeSpentFormatted = React.useMemo(() => {
    const seconds = attempt?.timeSpentSeconds || 5400; // default 90 min
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m} minute`;
  }, [attempt?.timeSpentSeconds]);

  // Evaluation criteria definitions for Subiectul III
  const criteriaList = [
    {
      id: "criteriu_1",
      title: "1. Încadrarea normativă & articole de lege incidente",
      max: 6,
      description:
        "Identificarea corectă a temeiului juridic (ex: Legea 198/2023 Art. 209-216, ROFUIP, Codul-cadru de etică). Citarea exactă a articolelor și definirea gravității faptei.",
      guide: "6p = toate articolele relevante indicate; 4p = legislație generală indicată corect; 2p = confuzii minore de articole; 0p = fără încadrare juridică.",
    },
    {
      id: "criteriu_2",
      title: "2. Modele de conducere & leadership (Tony Bush)",
      max: 6,
      description:
        "Analiza deciziei manageriale prin prisma modelelor teoretice: Modelul Formal (ierarhie, norme stricte) vs. Modelul Colegial / Politic (negociere, mediere, consens).",
      guide: "6p = analiză comparativă nuanțată Formal vs. Colegial; 4p = aplicare doar a modelului formal; 2p = menționare sumară; 0p = lipsă raportare teoretică.",
    },
    {
      id: "criteriu_3",
      title: "3. Etape procedurale legale & dreptul la apărare",
      max: 6,
      description:
        "Respectarea etapelor procedurale: sesizarea scrisă, rolul CA, numirea Comisiei de Cercetare Prealabilă, audierea cadrului didactic, întocmirea raportului în termen legal.",
      guide: "6p = toate etapele procedurale și termenele respectate; 4p = omisiune minoră a unui termen; 2p = nerespectarea dreptului la apărare; 0p = vicii procedurale grave.",
    },
    {
      id: "criteriu_4",
      title: "4. Măsuri manageriale de remediere & climat școlar",
      max: 6,
      description:
        "Soluții manageriale pe termen mediu și lung: consiliere psihopedagogică, medierea conflictului, măsuri de prevenire a recidivei și restabilirea climatului de încredere.",
      guide: "6p = plan de măsuri integrat pe termen scurt și mediu; 4p = doar măsuri punitive imediate; 2p = propuneri vagi; 0p = lipsă măsuri de remediere.",
    },
    {
      id: "criteriu_5",
      title: "5. Redactare, terminologie pedagogică & logică",
      max: 6,
      description:
        "Coerența expunerii, structurarea pe secțiuni logice (I, II, III), utilizarea vocabularului juridico-educațional adecvat și respectarea normelor ortografice.",
      guide: "6p = stil academic riguros, limbaj de specialitate impecabil; 4p = stil clar, mici ezitări de vocabular; 2p = exprimare colocvială; 0p = incoerență gravă.",
    },
  ];

  const handleUpdateCriterion = (critId: string, value: number) => {
    setRubricScoresSub3((prev) => ({
      ...prev,
      [critId]: Math.max(0, Math.min(6, value)),
    }));
  };

  const handleSaveEvaluation = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await saveExamEvaluationAction({
        examId: exam.id,
        sub1Score,
        sub2Score: selfScoreSub2,
        sub3Score,
        totalScore,
        rubricScores: rubricScoresSub3,
        timeSpentSeconds: attempt?.timeSpentSeconds,
      });

      if (res.success) {
        setSaveSuccess(true);
        const now = new Date();
        setLastSavedAt(
          `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
        );
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Save evaluation error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyEssayToClipboard = () => {
    const textToCopy = attempt?.subiectul3Text || sampleStudentEssay;
    navigator.clipboard.writeText(textToCopy);
    setCopiedEssay(true);
    setTimeout(() => setCopiedEssay(false), 2000);
  };

  // Sample student essay text if user viewed directly
  const sampleStudentEssay =
    attempt?.subiectul3Text?.trim() ||
    `În calitate de manager școlar, analiza acestei spețe impune respectarea strictă a normelor legale coroborate cu principiile leadershipului colegial descris de Tony Bush.

I. Încadrarea normativă:
Faptele reclamate se încadrează în prevederile Art. 209 din Legea Învățământului Preuniversitar nr. 198/2023 privind îndatoririle personalului didactic și încălcarea demnității profesionale. Conform legislației în vigoare, orice sesizare scrisă trebuie înregistrată la secretariatul unității de învățământ și înaintată Consiliului de Administrație.

II. Etapele procedurale obligatorii:
1. Înaintarea sesizării către Consiliul de Administrație, care decide oportunitatea cercetării disciplinare prealabile.
2. Numirea Comisiei de Cercetare Disciplinară Prealabilă prin hotărâre a CA (formată din 3-5 membri cu grad didactic egal sau superior).
3. Convocarea scrisă a cadrului didactic cu cel puțin 48 de ore înainte de audiere, garantând dreptul la apărare și prezența unui reprezentant sindical.
4. Finalizarea raportului de cercetare în termen de maximum 30 de zile de la numirea comisiei.

III. Dimensiunea managerială (Tony Bush):
Din perspectiva Modelului Formal, directorul are obligația de a aplica legea fără derogări, protejând instituția de vicii de procedură ce ar putea fi anulate în instanță. Totuși, Modelul Colegial impune implicarea comisiei paritare și a consiliului profesoral pentru medierea tensiunilor interne și restaurarea unui climat sigur de învățare.

IV. Măsuri de remediere:
Monitorizarea activității didactice, consiliere psihopedagogică pentru elevii afectați și revizuirea Codului de Conduită în Consiliul Profesoral.`;

  const wordCount = sampleStudentEssay.trim().split(/\s+/).length;

  // Domain Mastery calculations
  const masteryData = [
    {
      domain: "Legislație Școlară & Reglementări",
      scorePct: Math.round(((sub1Score * 0.5 + rubricScoresSub3.criteriu_1 + rubricScoresSub3.criteriu_3) / (15 + 12)) * 100),
      status: "Avansat",
      statusColor: "text-emerald-500",
      description: "Art. 209-216 din Legea 198/2023, ROFUIP, dreptul la apărare și răspunderea patrimonială/disciplinară.",
      lessons: [
        {
          title: "Ziua 1 — Legea 198/2023: Structură și Principii Fundamentale",
          url: "/modules/saptamana-1-legislatie-si-statut-cadru/ziua-1-legea-198-2023-structura-principii",
        },
        {
          title: "Ziua 16 — Răspunderea Disciplinară: Abateri, Sesizări și Comisia de Cercetare",
          url: "/modules/saptamana-4-raspundere-disciplinara-si-jurisprudenta/ziua-16-abateri-disciplinare-si-sanctiuni",
        },
      ],
    },
    {
      domain: "Curriculum, Didactică & Teoria Evaluării",
      scorePct: Math.round(((sub1Score * 0.5 + selfScoreSub2) / (15 + 30)) * 100),
      status: "Competent",
      statusColor: "text-blue-500",
      description: "Curriculum centrat pe competențe, feedback didactic formativ (Hattie d=0.75), rubrici de evaluare.",
      lessons: [
        {
          title: "Ziua 6 — Curriculumul Național: Arhitectură și Competențe-Cheie",
          url: "/modules/saptamana-2-curriculum-si-evaluare-nationala/ziua-6-curriculum-national-arhitectura-si-componente",
        },
        {
          title: "Ziua 8 — Evaluarea Didactică: Formativă vs. Sumativă, Rubrici și Feedback Hattie",
          url: "/modules/saptamana-2-curriculum-si-evaluare-nationala/ziua-8-evaluare-formativa-sumativa-standardizata",
        },
      ],
    },
    {
      domain: "Leadership & Guvernanță Educațională",
      scorePct: Math.round(((rubricScoresSub3.criteriu_2 + rubricScoresSub3.criteriu_4 + rubricScoresSub3.criteriu_5) / 18) * 100),
      status: "Excelent",
      statusColor: "text-purple-500",
      description: "Modelele lui Tony Bush (Formal, Colegial, Politic), atribuțiile CA, managementul conflictelor.",
      lessons: [
        {
          title: "Ziua 11 — Consiliul de Administrație: Componență, Cvorum și Atribuții Decizionale",
          url: "/modules/saptamana-3-management-si-guvernanta-in-invatamant/ziua-11-consiliul-de-administratie-rol-si-atributii",
        },
        {
          title: "Modulul 5 — Bancă de Spețe Manageriale (40 de Spețe Rezolvate)",
          url: "/modules/saptamana-5-banca-de-spete-manageriale",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Top Header & Breadcrumb */}
      <header className="sticky top-0 z-30 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link
              href="/simulare"
              className="text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Simulări 100p</span>
            </Link>
            <div className="h-4 w-px bg-border/80 hidden sm:block" />
            <div className="flex items-center gap-2 truncate">
              <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 border-primary/30 text-primary shrink-0">
                {exam.badge_label}
              </Badge>
              <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                Raport Diagnostic: {exam.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveEvaluation}
              disabled={isSaving}
              className="h-9 rounded-xl text-xs font-bold gap-1.5 border-primary/30 hover:bg-primary/5 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">
                {isSaving ? "Se salvează..." : saveSuccess ? "Salvat cu Succes!" : "Salvează Autoevaluarea"}
              </span>
            </Button>

            <Link
              href={`/simulare/${exam.slug}`}
              className={cn(buttonVariants({ size: "sm" }), "h-9 rounded-xl text-xs font-bold gap-1.5 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90")}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reia Simularea</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
        {/* Banner notification if save completed */}
        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between transition-all animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Autoevaluarea și nota finală ({totalScore}/100) au fost sincronizate în profilul tău!</span>
            </div>
            {lastSavedAt && <span className="text-[11px] opacity-80">Salvat la {lastSavedAt}</span>}
          </div>
        )}

        {/* 1. HERO TOTAL SCORE & QUALIFICATION CARD */}
        <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Overall Grade Display */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-2 border-b lg:border-b-0 lg:border-r border-border/80 pb-6 lg:pb-0 lg:pr-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Punctaj Total Examen
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-foreground">
                  {totalScore}
                </span>
                <span className="text-xl font-bold text-muted-foreground">/ 100</span>
              </div>

              {/* Admission qualification badge */}
              <div className="pt-1">
                {totalScore >= 90 ? (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" /> ADMIS — Calificativ Excelent (Nota 9-10)
                  </Badge>
                ) : totalScore >= 80 ? (
                  <Badge className="bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30 text-xs font-bold px-3 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> ADMIS — Calificativ Foarte Bine (Nota 8-9)
                  </Badge>
                ) : totalScore >= 70 ? (
                  <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> ADMIS — Prag Minim Promovat (Nota 7-8)
                  </Badge>
                ) : (
                  <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-xs font-bold px-3 py-1">
                    <XCircle className="h-3.5 w-3.5 mr-1" /> SUB PRAGUL DE PROMOVARE (&lt; 70p)
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                Pragul oficial de promovare conform metodologiei naționale este de <strong>70 puncte (nota 7.00)</strong>.
              </p>
            </div>

            {/* Right: Section Breakdown 4-Cards */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-muted-foreground">
                  Componența Baremului Oficial (100 Puncte)
                </span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Timp examen: {timeSpentFormatted} / 180 min</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Subiectul I */}
                <div className="p-3.5 rounded-2xl bg-background/80 border border-border/80 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground truncate">
                    Subiectul I (Grilă)
                  </div>
                  <div className="text-xl font-extrabold text-foreground">
                    {sub1Score} <span className="text-xs font-normal text-muted-foreground">/ 30p</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {sub1CorrectCount} din 10 corecte
                  </div>
                </div>

                {/* Subiectul II */}
                <div className="p-3.5 rounded-2xl bg-background/80 border border-border/80 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground truncate">
                    Subiectul II (Didactică)
                  </div>
                  <div className="text-xl font-extrabold text-foreground">
                    {selfScoreSub2} <span className="text-xs font-normal text-muted-foreground">/ 30p</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Eseu didactic autoevaluat
                  </div>
                </div>

                {/* Subiectul III */}
                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/25 shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-primary truncate flex items-center gap-1">
                    <Sliders className="h-3 w-3" /> Subiectul III (Speță)
                  </div>
                  <div className="text-xl font-extrabold text-primary">
                    {sub3Score} <span className="text-xs font-normal text-muted-foreground">/ 30p</span>
                  </div>
                  <div className="text-[10px] text-primary/80 font-medium">
                    Calculat din rubrică
                  </div>
                </div>

                {/* Din Oficiu */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    Din Oficiu
                  </div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {exam.oficiu_points}{" "}
                    <span className="text-xs font-normal text-muted-foreground">/ 10p</span>
                  </div>
                  <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                    Garantat prin lege
                  </div>
                </div>
              </div>

              {/* Visual Progress Bar with Threshold Marker */}
              <div className="pt-2 space-y-1.5">
                <div className="relative w-full h-3 bg-secondary/80 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      totalScore >= 70
                        ? "bg-linear-to-r from-primary to-emerald-500"
                        : "bg-linear-to-r from-rose-500 to-amber-500"
                    )}
                    style={{ width: `${totalScore}%` }}
                  />
                  {/* 70p pass line marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-foreground/60 z-10"
                    style={{ left: "70%" }}
                    title="Prag minim promovare (70p)"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-muted-foreground px-0.5">
                  <span>0p</span>
                  <span className="text-foreground font-bold">Prag Admisibil: 70p</span>
                  <span>100p</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SUBIECTUL III INTERACTIVE SELF-EVALUATOR (SIDE-BY-SIDE) */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                  Barem & Autoevaluare
                </Badge>
                <span className="text-xs font-semibold text-muted-foreground">Subiectul III (30 Puncte)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground pt-1">
                Autoevaluator Interactiv pe Rubrică & Comparație Soluție
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                Punctaj curent Subiectul III:
              </span>
              <Badge variant="outline" className="text-sm font-black px-3 py-1 bg-background border-primary/30 text-primary">
                {sub3Score} / 30 puncte
              </Badge>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Compară eseul redactat de tine la Subiectul III cu soluția exemplară oficială și ajustează
            punctajele fiecărui criteriu de evaluare. Fiecare modificare recalculează nota totală a examenului în timp real.
          </p>

          {/* Side-by-side Dual Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Candidate's Essay */}
            <div className="lg:col-span-5 space-y-3">
              <Card className="p-5 sm:p-6 space-y-4 border-border/80 bg-card shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">
                      Eseul Tău Redactat
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                      {wordCount} cuvinte
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={copyEssayToClipboard}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Copiază textul eseului"
                    >
                      {copiedEssay ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>

                {/* Prompt reference toggle/box */}
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/40 text-xs space-y-1">
                  <span className="font-bold text-foreground">Cerința Speței Manageriale:</span>
                  <p className="text-muted-foreground line-clamp-3 hover:line-clamp-none transition-all leading-relaxed">
                    {exam.subiectul_3.question}
                  </p>
                </div>

                {/* Essay body */}
                <div className="p-4 rounded-2xl bg-background border border-border/60 max-h-[520px] overflow-y-auto space-y-3 font-mono text-xs leading-relaxed text-foreground whitespace-pre-line shadow-inner">
                  {sampleStudentEssay}
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Volum recomandat: 300-500 cuvinte</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Structură completă
                  </span>
                </div>
              </Card>
            </div>

            {/* RIGHT COLUMN: Official Barem, Exemplar Answer & 5 Interactive Rubric Criteria */}
            <div className="lg:col-span-7 space-y-4">
              <Tabs defaultValue="rubrica" className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-secondary/70 rounded-2xl">
                  <TabsTrigger value="rubrica" className="rounded-xl text-xs font-bold gap-1.5 py-2">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Rubrică Interactivă (5 Criterii)</span>
                  </TabsTrigger>
                  <TabsTrigger value="exemplar" className="rounded-xl text-xs font-bold gap-1.5 py-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Soluție Exemplară & Barem</span>
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: INTERACTIVE 5-CRITERION RUBRIC */}
                <TabsContent value="rubrica" className="space-y-4 pt-2">
                  <div className="space-y-3">
                    {criteriaList.map((crit, index) => {
                      const currentScore = rubricScoresSub3[crit.id] ?? 5;

                      return (
                        <Card
                          key={crit.id}
                          className="p-4 sm:p-5 space-y-3.5 border-border/80 bg-card hover:border-primary/30 transition-all shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground">
                                  {crit.title}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {crit.description}
                              </p>
                            </div>

                            <div className="flex flex-col items-end shrink-0">
                              <span className="text-base font-black text-primary">
                                {currentScore} <span className="text-xs font-normal text-muted-foreground">/ {crit.max}p</span>
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {currentScore === 6
                                  ? "Maxim"
                                  : currentScore >= 4
                                  ? "Bun"
                                  : currentScore >= 2
                                  ? "Parțial"
                                  : "Nesatisfăcător"}
                              </span>
                            </div>
                          </div>

                          {/* Interactive Score Selector: Presets & Slider */}
                          <div className="space-y-2 pt-1 border-t border-border/40">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                {[0, 2, 4, 6].map((scorePreset) => (
                                  <button
                                    key={scorePreset}
                                    type="button"
                                    onClick={() => handleUpdateCriterion(crit.id, scorePreset)}
                                    className={cn(
                                      "px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer",
                                      currentScore === scorePreset
                                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                        : "bg-background text-muted-foreground hover:text-foreground border-border/80 hover:bg-secondary"
                                    )}
                                  >
                                    {scorePreset}p
                                  </button>
                                ))}
                              </div>

                              <div className="flex items-center gap-2 flex-1 max-w-[180px] sm:max-w-[200px]">
                                <input
                                  type="range"
                                  min={0}
                                  max={6}
                                  step={1}
                                  value={currentScore}
                                  onChange={(e) => handleUpdateCriterion(crit.id, parseInt(e.target.value))}
                                  className="w-full accent-primary cursor-pointer h-2 bg-secondary rounded-lg"
                                />
                                <span className="text-xs font-mono font-bold w-4 text-right">
                                  {currentScore}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-muted-foreground/90 italic">
                              Barem: {crit.guide}
                            </p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Summary Footer for Subiectul III Rubric */}
                  <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground">
                        Total Autoevaluare Subiectul III:
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        5 criterii validate conform baremului oficial MEN / CNPEE
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-primary">
                        {sub3Score} / 30
                      </span>
                      <span className="text-xs font-bold text-muted-foreground ml-1">puncte</span>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 2: OFFICIAL EXEMPLAR ANSWER & CITATIONS */}
                <TabsContent value="exemplar" className="space-y-4 pt-2">
                  <Card className="p-5 sm:p-6 space-y-4 border-border/80 bg-card">
                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h3 className="font-bold text-sm text-foreground">
                          Răspuns Model / Soluție Exemplară
                        </h3>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                        30 / 30 Puncte (Barem Maxim)
                      </Badge>
                    </div>

                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 font-mono text-xs leading-relaxed text-foreground whitespace-pre-line max-h-[480px] overflow-y-auto">
                      {exam.subiectul_3.sample_answer}
                    </div>

                    {exam.subiectul_3.citation && (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <span className="font-bold text-foreground">Referință legislativă & bibliografie: </span>
                          <span className="text-muted-foreground">{exam.subiectul_3.citation}</span>
                        </div>
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* 3. MASTERY BREAKDOWN BY DOMAIN & RECOMMENDED LESSONS */}
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                Profil Diagnostic pe Domenii & Plan de Consolidare
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Analiză detaliată a competențelor tale pe cele 3 mari domenii ale examenului. Urmează
              lecțiile recomandate pentru a elimina lacunele înainte de proba oficială.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {masteryData.map((m) => (
              <Card
                key={m.domain}
                className="p-5 sm:p-6 space-y-4 border-border/80 bg-card hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-foreground leading-snug">
                      {m.domain}
                    </h3>
                    <span className="text-lg font-black text-primary">
                      {m.scorePct}%
                    </span>
                  </div>

                  {/* Progress gauge bar */}
                  <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        m.scorePct >= 85
                          ? "bg-emerald-500"
                          : m.scorePct >= 70
                          ? "bg-blue-500"
                          : "bg-amber-500"
                      )}
                      style={{ width: `${m.scorePct}%` }}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {m.description}
                  </p>
                </div>

                {/* Direct lesson recommendation links */}
                <div className="space-y-2 pt-3 border-t border-border/50">
                  <span className="text-[11px] font-bold text-foreground block">
                    Lecții Recomandate pentru Aprofundare:
                  </span>
                  <div className="space-y-1.5">
                    {m.lessons.map((lesson, lIdx) => (
                      <Link
                        key={lIdx}
                        href={lesson.url}
                        className="group flex items-center justify-between p-2 rounded-xl bg-secondary/40 hover:bg-primary/10 border border-transparent hover:border-primary/20 text-xs transition-colors"
                      >
                        <span className="font-medium text-foreground group-hover:text-primary line-clamp-1">
                          {lesson.title}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 4. SUBIECTUL I DETAILED ITEM REVIEW */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-foreground">
                Revizuire Grile Subiectul I (10 Itemi)
              </h2>
              <p className="text-xs text-muted-foreground">
                Verifică explicațiile și temeiul legal pentru fiecare întrebare grilă din examen.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-bold border-primary/30 text-primary">
              {sub1Score} / 30p ({sub1CorrectCount} corecte)
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exam.subiectul_1.questions.map((q, idx) => {
              const userAns = attempt?.subiectul1Answers?.[q.id];
              const isCorrect = typeof userAns === "number" && userAns === q.correct_option_index;
              const hasAnswered = typeof userAns === "number";

              return (
                <Card
                  key={q.id}
                  className={cn(
                    "p-4 sm:p-5 space-y-3 border transition-all text-xs",
                    isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : hasAnswered
                      ? "border-rose-500/30 bg-rose-500/5"
                      : "border-border/80 bg-card"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-foreground leading-snug">
                      {q.question}
                    </span>
                    {isCorrect ? (
                      <Badge className="bg-emerald-600 text-white text-[10px] shrink-0">
                        +3p Corect
                      </Badge>
                    ) : hasAnswered ? (
                      <Badge className="bg-rose-600 text-white text-[10px] shrink-0">
                        0p Greșit
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        Nedifinit
                      </Badge>
                    )}
                  </div>

                  {/* Options display */}
                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correct_option_index;
                      const isOptionSelected = optIdx === userAns;

                      return (
                        <div
                          key={optIdx}
                          className={cn(
                            "p-2 rounded-lg border text-xs flex items-center justify-between",
                            isOptionCorrect
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold"
                              : isOptionSelected
                              ? "bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-300 line-through"
                              : "bg-background/60 border-border/40 text-muted-foreground"
                          )}
                        >
                          <span>{opt}</span>
                          {isOptionCorrect && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Citation */}
                  {q.explanation && (
                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/50 text-[11px] text-muted-foreground space-y-1">
                      <p>
                        <strong className="text-foreground">Explicație: </strong>
                        {q.explanation}
                      </p>
                      {q.citation && (
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <BookOpen className="h-3 w-3" />
                          <span>{q.citation}</span>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* 5. BOTTOM ACTIONS */}
        <section className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-secondary/40 border border-border/80">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground">
              Continuă Pregătirea
            </h3>
            <p className="text-xs text-muted-foreground">
              Exersează mai multe grile punctuale sau explorează spețele manageriale detaliate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/practice"
              className={cn(buttonVariants({ variant: "outline" }), "rounded-xl text-xs font-bold gap-1.5 h-10")}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Hub de Practică</span>
            </Link>
            <Button
              onClick={handleSaveEvaluation}
              disabled={isSaving}
              className="rounded-xl text-xs font-bold gap-1.5 h-10 shadow-xs cursor-pointer bg-primary text-primary-foreground"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Se salvează..." : "Salvează Rezultatul Final"}</span>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
