import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";
import { User, LogOut, CheckCircle, Clock } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              Cont Activ
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Panou de Control</h1>
          <p className="text-muted-foreground text-sm">
            Bine ai venit, <span className="font-semibold text-foreground">{user.email}</span>
          </p>
        </div>

        <form action={signOut}>
          <Button variant="outline" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            <span>Deconectare</span>
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lecții Finalizate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 / 20</div>
            <p className="text-xs text-muted-foreground mt-1">
              Progres calculat din înregistrările salvate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scor Mediu Grile</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nu există teste finalizate încă
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Identificator Utilizator</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono truncate text-muted-foreground">
              {user.id}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Securizat prin RLS (Row Level Security)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
