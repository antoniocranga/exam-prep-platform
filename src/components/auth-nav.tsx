"use client";

import * as React from "react";
import Link from "next/link";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/auth/actions";

interface AuthNavProps {
  mode?: "desktop" | "mobile";
  onItemClick?: () => void;
}

export function AuthNav({ mode = "desktop", onItemClick }: AuthNavProps) {
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClient();

    // Check current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />;
  }

  // Mobile drawer variant
  if (mode === "mobile") {
    if (userEmail) {
      return (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted/50 border border-border/60">
            <User className="h-4 w-4 text-primary shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted-foreground font-medium">Conectat ca</span>
              <span className="text-xs font-bold truncate text-foreground">{userEmail}</span>
            </div>
          </div>
          <Link
            href="/dashboard"
            onClick={onItemClick}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-foreground"
          >
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <span>Panou de control</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              await signOut();
              window.location.href = "/";
            }}
            className="w-full justify-center gap-2 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Deconectare</span>
          </Button>
        </div>
      );
    }

    return (
      <Link href="/auth/signin" onClick={onItemClick} className="w-full">
        <Button className="w-full rounded-xl" size="sm">
          Autentificare
        </Button>
      </Link>
    );
  }

  // Desktop header variant with dropdown menu
  if (userEmail) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="sm" className="gap-2 cursor-pointer rounded-xl font-medium" />}
        >
          <User className="h-4 w-4 text-primary" />
          <span className="max-w-[120px] truncate text-xs sm:text-sm">
            {userEmail}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl rounded-2xl border-border/80 bg-popover">
          <DropdownMenuLabel className="font-normal px-2.5 py-2 bg-muted/40 rounded-xl mb-1">
            <div className="flex flex-col space-y-0.5">
              <p className="text-[11px] text-muted-foreground font-medium">Conectat ca</p>
              <p className="text-xs font-bold truncate text-foreground">{userEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="flex items-center gap-2 cursor-pointer py-2 px-2.5 rounded-xl text-xs font-semibold"
          >
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <span>Panou de control</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              await signOut();
              window.location.href = "/";
            }}
            className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer py-2 px-2.5 rounded-xl text-xs font-semibold hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Deconectare</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link href="/auth/signin">
      <Button variant="outline" size="sm" className="rounded-xl">
        Autentificare
      </Button>
    </Link>
  );
}
