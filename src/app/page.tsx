import Link from "next/link";
import { BookOpen, Sparkles, ArrowRight, Layers, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-28 border-b bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs sm:text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-primary inline" />
            Platformă Inteligentă de Pregătire
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight sm:leading-tight">
            Excelență în Pregătirea pentru Examen
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistem structurat de învățare bazat pe module progresive, sinteze curriculare, teste interactive și monitorizare a performanței.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/modules">
              <Button size="lg" className="h-11 px-6 gap-2">
                Explorează Modulele
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/practice">
              <Button size="lg" variant="outline" className="h-11 px-6">
                Sesiune de Practică
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="w-full py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Layers className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">Module Structurate</CardTitle>
                <CardDescription>
                  Parcurgere secvențială organizată pe unități de învățare și module de pregătire.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Conținutul este distribuit dinamic din baza de date centralizată, adaptat la cerințele examenului.
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <BookOpen className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">Învățare Activă</CardTitle>
                <CardDescription>
                  Grile cu răspuns multiplu, întrebări de sinteză și seturi de flashcarduri pentru retenție.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Exerciții interactive generate pe baza surselor legislative și a bibliografiei oficiale.
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Trophy className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">Urmărire Progres</CardTitle>
                <CardDescription>
                  Metrici detaliate, scoruri la teste și starea completării fiecărei lecții în timp real.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Sincronizare automată a stării utilizatorului securizată la nivel de înregistrare (RLS).
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dynamic Data Hook Section */}
      <section className="w-full py-12 bg-muted/40 border-t">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="rounded-xl border bg-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Ești gata să începi studiul?</h2>
              <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
                Conectează-te pentru a-ți salva progresul la fiecare lecție parcursă și pentru a primi recomandări personalizate de recapitulare.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href="/auth/signup">
                <Button className="h-10 px-5">Creează Cont</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
