"use client";

import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  isLoading = false,
  placeholder = "Caută în legislație (ex: Art. 207, ROFUIP, Bush, spețe)...",
  className,
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus with Ctrl+K / Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("relative w-full group", className)}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground transition-colors group-focus-within:text-primary">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>

      <Input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "w-full pl-10 pr-24 h-12 text-sm sm:text-base rounded-2xl bg-card border-border/70",
          "shadow-xs transition-all duration-200",
          "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60",
          "placeholder:text-muted-foreground/70"
        )}
      />

      <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1.5">
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              onChange("");
              onClear?.();
              inputRef.current?.focus();
            }}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Șterge căutarea"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}

        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground bg-muted/60 border border-border/80 rounded-md select-none pointer-events-none">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </div>
  );
}
