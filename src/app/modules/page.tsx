import Link from "next/link";
import { Layers, AlertCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ModulesPage() {
  let modules: Array<{
    id: string;
    title: string;
    slug: string;
    order_index: number;
    description: string | null;
  }> = [];

  let errorMessage: string | null = null;
  const hasEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (hasEnv) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("modules")
        .select("id, title, slug, order_index, description")
        .order("order_index", { ascending: true });

      if (error) {
        errorMessage = error.message;
      } else if (data) {
        modules = data;
      }
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : "Eroare la conectarea cu Supabase.";
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-semibold">
            Curriculum Oficial
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Module de Învățare
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          Unitățile de pregătire sunt încărcate dinamic din baza de date centralizată.
        </p>
      </div>

      {!hasEnv && (
        <Card className="border-amber-500/30 bg-amber-500/5 mb-8">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <CardTitle className="text-base text-amber-800 dark:text-amber-300">
                Configurare Supabase în așteptare
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Variabilele de mediu (<code>NEXT_PUBLIC_SUPABASE_URL</code> și{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) nu sunt încă configurate în{" "}
                <code>.env.local</code>.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {errorMessage && (
        <Card className="border-destructive/30 bg-destructive/5 mb-8">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <CardTitle className="text-base text-destructive">
                Eroare la încărcarea modulelor
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {errorMessage}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {hasEnv && !errorMessage && modules.length === 0 && (
        <Card className="border-dashed p-10 text-center">
          <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
            <Layers className="h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-medium">Niciun modul disponibil momentan</h3>
            <p className="text-sm text-muted-foreground">
              Modulele vor apărea automat de îndată ce datele de structură sunt publicate în baza de date.
            </p>
          </div>
        </Card>
      )}

      {modules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((m) => (
            <Card key={m.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="secondary">Modulul {m.order_index}</Badge>
                </div>
                <CardTitle className="text-xl font-bold">{m.title}</CardTitle>
                {m.description && (
                  <CardDescription className="text-sm line-clamp-2">
                    {m.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <Link href={`/modules/${m.slug}`}>
                  <Button variant="outline" className="w-full justify-between group">
                    <span>Deschide modulul</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
