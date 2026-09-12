"use client";

import * as React from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/auth/actions";

interface LogoutButtonProps {
  variant?: "outline" | "default" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export function LogoutButton({
  variant = "outline",
  size = "sm",
  className,
  showText = true,
}: LogoutButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      await signOut();
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={loading}
      onClick={handleLogout}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
      ) : (
        <LogOut className="h-4 w-4 mr-1.5" />
      )}
      {showText && <span>{loading ? "Se deconectează..." : "Deconectare"}</span>}
    </Button>
  );
}
