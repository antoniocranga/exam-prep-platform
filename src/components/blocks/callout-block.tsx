import * as React from "react";
import { Info, AlertTriangle, Lightbulb, Scale, Sparkles } from "lucide-react";
import { LessonBlockRow } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CalloutBlockProps {
  block: LessonBlockRow;
}

export function CalloutBlock({ block }: CalloutBlockProps) {
  const content = (block.content_json || {}) as Record<string, unknown>;
  const title = (content.title || content.header || "") as string;
  const message = (content.text || content.message || content.body || "") as string;
  const rawVariant = String(content.variant || content.type || "info").toLowerCase();

  const getVariantConfig = () => {
    if (rawVariant.includes("trap") || rawVariant.includes("warning") || rawVariant.includes("atentie")) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />,
        badge: "Capcană Frecventă de Examen",
        badgeVariant: "border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-300",
        container: "border-amber-500/30 bg-amber-500/5 shadow-xs shadow-amber-500/5",
        accentBar: "bg-amber-500",
      };
    }
    if (rawVariant.includes("tip") || rawVariant.includes("success") || rawVariant.includes("retine")) {
      return {
        icon: <Lightbulb className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />,
        badge: "Reține & Sinteză Esențială",
        badgeVariant: "border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
        container: "border-emerald-500/30 bg-emerald-500/5 shadow-xs shadow-emerald-500/5",
        accentBar: "bg-emerald-500",
      };
    }
    if (rawVariant.includes("law") || rawVariant.includes("legislat") || rawVariant.includes("normat")) {
      return {
        icon: <Scale className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />,
        badge: "Temei Normativ Obligatoriu",
        badgeVariant: "border-indigo-500/30 bg-indigo-500/15 text-indigo-800 dark:text-indigo-300",
        container: "border-indigo-500/30 bg-indigo-500/5 shadow-xs shadow-indigo-500/5",
        accentBar: "bg-indigo-500",
      };
    }
    return {
      icon: <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />,
      badge: "Notă Explicativă",
      badgeVariant: "border-primary/30 bg-primary/10 text-primary",
      container: "border-primary/20 bg-primary/5 shadow-xs shadow-primary/5",
      accentBar: "bg-primary",
    };
  };

  const config = getVariantConfig();

  return (
    <div
      className={cn(
        "my-6 relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all",
        config.container
      )}
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", config.accentBar)} />

      <div className="flex items-start gap-4">
        <div className="p-2 rounded-xl bg-background/80 shadow-xs border shrink-0">
          {config.icon}
        </div>

        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn("text-[10px] font-semibold uppercase tracking-wider", config.badgeVariant)}
            >
              {config.badge}
            </Badge>
            {title && (
              <span className="text-sm font-bold text-foreground">
                {title}
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

