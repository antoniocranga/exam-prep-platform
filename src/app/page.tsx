import Link from "next/link";
import { BookOpen, Sparkles, ArrowRight, Layers, Trophy, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-28 lg:py-32 border-b border-border/70 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary mb-6 shadow-xs animate-in fade-in slide-in-from-top-3 duration-500">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Platformă Modernă de Pregătire Examen</span>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <span className="hidden sm:inline font-mono text-[11px] text-muted-foreground">Curriculă 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.08]">
            Învață Inteligent.{" "}
            <span className="bg-gradient-to-r from-primary via-indigo-600 to-purple-500 bg-clip-text text-transparent">
              Reușește la Examen.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Sistem interactiv bazat pe sinteze clare, flashcarduri pentru repetare spațiată și teste grilă validate conform legislației oficiale.
          </p>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <Link href="/modules">
              <Button size="lg" className="h-12 px-7 rounded-xl gap-2 font-semibold shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Explorează Modulele
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/practice">
              <Button size="lg" variant="outline" className="h-12 px-7 rounded-xl font-semibold hover:bg-muted/80 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Sesiune de Practică
              </Button>
            </Link>
          </div>

          {/* Quick Stats Highlights */}
          <div className="mt-14 pt-8 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">4</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Module Complete</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">20</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Zile de Studiu</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">100%</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Surse Oficiale</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">10+</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Tipuri Interactive</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="w-full py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Tot ce ai nevoie pentru pregătire completă</h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-2">
              Fiecare zi de curs combină teoria sintetizată cu exerciții practice aplicate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl border border-border/80 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <CardHeader className="p-6">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-primary flex items-center justify-center mb-4">
                  <Layers className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Module Structurate</CardTitle>
                <CardDescription className="text-xs sm:text-sm pt-1">
                  Parcurgere secvențială organizată pe unități de învățare și zile de pregătire.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 text-sm text-muted-foreground leading-relaxed">
                Conținutul este distribuit dinamic din baza de date centralizată, adaptat la cerințele examenului.
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/80 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all duration-300">
              <CardHeader className="p-6">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Învățare Activă</CardTitle>
                <CardDescription className="text-xs sm:text-sm pt-1">
                  Grile cu răspuns multiplu, întrebări de sinteză și seturi de flashcarduri.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 text-sm text-muted-foreground leading-relaxed">
                Exerciții interactive generate pe baza surselor legislative și a bibliografiei oficiale.
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/80 shadow-xs hover:border-amber-500/40 hover:shadow-md transition-all duration-300">
              <CardHeader className="p-6">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Urmărire Progres</CardTitle>
                <CardDescription className="text-xs sm:text-sm pt-1">
                  Metrici detaliate, scoruri la teste și starea completării fiecărei lecții.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 text-sm text-muted-foreground leading-relaxed">
                Sincronizare automată a stării utilizatorului securizată la nivel de înregistrare (RLS).
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dynamic Data Hook Section */}
      <section className="w-full py-16 bg-muted/30 border-t border-border/60">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="rounded-3xl border border-primary/20 bg-card p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
                  <Zap className="h-3 w-3 mr-1" />
                  Sincronizare în Cloud
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ești gata să începi studiul?</h2>
              <p className="text-muted-foreground max-w-xl text-sm sm:text-base leading-relaxed">
                Conectează-te pentru a-ți salva progresul la fiecare lecție parcursă și pentru a primi recomandări personalizate de recapitulare.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href="/auth/signup">
                <Button className="h-11 px-6 rounded-xl font-semibold shadow-xs">Creează Cont Gratuit</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

