"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, Suspense } from "react";
import { GraduationCap, AlertCircle, Loader2 } from "lucide-react";
import { signIn, AuthState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function SignInForm() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const [state, formAction, isPending] = useActionState<AuthState | null, FormData>(
    signIn,
    null
  );

  return (
    <Card className="w-full max-w-md shadow-lg border">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <GraduationCap className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Autentificare</CardTitle>
        <CardDescription>
          Introduceți adresa de email și parola pentru a accesa platforma.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="redirect" value={redirectPath} />
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nume@exemplu.ro"
              autoComplete="email"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Parolă</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isPending}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Se autentifică..." : "Conectează-te"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Nu aveți cont încă?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Creează cont
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md h-96 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}
