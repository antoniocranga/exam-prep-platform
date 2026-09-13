import { Metadata } from "next";
import Link from "next/link";
import { Clock, Award, ArrowRight, ShieldCheck, GraduationCap, Scale, Sparkles, BookOpen } from "lucide-react";
import { getMockExamVariants } from "@/lib/exams/mock-exams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Simulări Oficiale Examen (100 Puncte) | ExamPrep",
  description:
    "Simulări oficiale de examen cu durată de 180 minute și barem de 100 de puncte pentru Definitivat, Titularizare și Concurs Director.",
};

export const dynamic = "force-dynamic";

function getBadgeStyle(type: string) {
  switch (type) {
    case "definitivat":
      return {
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        icon: Scale,
      };
    case "titularizare":
      return {
        badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
        icon: GraduationCap,
      };
    case "concurs_director":
      return {
        badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
        icon: Award,
      };
    default:
      return {
        badgeClass: "bg-muted text-muted-foreground border-border",
        icon: BookOpen,
      };
  }
}

export default async function SimulareHubPage() {
  const variants = await getMockExamVariants();

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12 space-y-10">
      {/* Header section */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/30 rounded-full"
          >
            <Award className="h-3.5 w-3.5" />
            <span>Simulări Naționale 100 Puncte</span>
          </Badge>
          <Badge variant="secondary" className="text-xs px-2.5 py-0.5 rounded-full">
            Standard Oficial 180 Minute
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Simulări Oficiale de Examen
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Exersează în condiții reale de concurs cu cronometru continuu de 180 de minute,
          structurate pe 3 subiecte (Grilă, Didactică/Curriculum, Speță Managerială) și barem
          standardizat pe 5 criterii.
        </p>
      </div>

      {/* Official Exam Format Banner */}
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-xs overflow-hidden">
        <CardContent className="p-6 sm:p-7">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                Timp Alocat
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-foreground font-extrabold text-xl">
                <Clock className="h-5 w-5 text-primary" />
                <span>180 Minute</span>
              </div>
              <p className="text-xs text-muted-foreground">3 ore continue</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                Subiectul I
              </span>
              <div className="text-foreground font-extrabold text-xl">30 Puncte</div>
              <p className="text-xs text-muted-foreground">10 întrebări grilă (3p/grilă)</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                Subiectul II
              </span>
              <div className="text-foreground font-extrabold text-xl">30 Puncte</div>
              <p className="text-xs text-muted-foreground">Didactică & Curriculum</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                Subiectul III + Oficiu
              </span>
              <div className="text-foreground font-extrabold text-xl">30p + 10p</div>
              <p className="text-xs text-muted-foreground">Speță + 10p din oficiu</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List of Mock Exam Variants */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>Variante Disponibile pentru Simulare</span>
        </h2>

        {variants.length === 0 ? (
          <Card className="border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Variantele de examen sunt în curs de sincronizare din baza de date centralizată.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {variants.map((v) => {
              const { badgeClass, icon: Icon } = getBadgeStyle(v.exam_type);

              return (
                <Card
                  key={v.id}
                  className="flex flex-col justify-between border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-200 group bg-card overflow-hidden"
                >
                  <CardHeader className="p-5 pb-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={`gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badgeClass}`}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{v.badge_label}</span>
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{v.duration_minutes} min</span>
                      </span>
                    </div>

                    <CardTitle className="text-lg font-bold leading-snug group-hover:text-primary transition-colors">
                      {v.title}
                    </CardTitle>

                    <CardDescription className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {v.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    <div className="bg-muted/40 p-3 rounded-xl border border-border/50 text-xs space-y-1.5">
                      <div className="flex justify-between font-medium">
                        <span className="text-muted-foreground">Punctaj maxim:</span>
                        <strong className="text-foreground">{v.total_points} puncte</strong>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Puncte din oficiu:</span>
                        <span>{v.oficiu_points} puncte</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Secțiuni:</span>
                        <span>3 Subiecte oficiale</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-5 pt-0 border-t border-border/50">
                    <Link href={`/simulare/${v.slug}`} className="w-full">
                      <Button className="w-full h-11 gap-2 rounded-xl font-bold shadow-xs cursor-pointer group/btn">
                        <span>Începe Simularea</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Practical Advice Note */}
      <Card className="p-5 border-border/70 bg-muted/20 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Instrucțiuni Importante pentru Candidați:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>
            Cronometrul începe imediat ce deschideți varianta și rămâne activ chiar dacă navigați
            între subiecte.
          </li>
          <li>
            Toate răspunsurile și textele redactate sunt salvate automat în timp real în memoria
            browserului (Local Draft).
          </li>
          <li>
            La finalizarea examenului, Subiectul I se corectează automat, iar baremul oficial pe 5
            criterii este afișat pentru autoevaluarea Subiectelor II și III.
          </li>
        </ul>
      </Card>
    </div>
  );
}
