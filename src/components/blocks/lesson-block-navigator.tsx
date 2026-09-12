"use client";

import * as React from "react";
import {
  BookOpen,
  HelpCircle,
  Layers,
  Code,
  AlertCircle,
  BookmarkCheck,
  Film,
  Compass,
} from "lucide-react";
import { BlockType, LessonBlockRow } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LessonBlockNavigatorProps {
  blocks: LessonBlockRow[];
}

const BLOCK_CONFIG: Record<
  BlockType,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  text: { label: "Teorie", icon: BookOpen },
  markdown: { label: "Sinteză", icon: BookOpen },
  callout: { label: "Puncte Cheie", icon: AlertCircle },
  flashcard_set: { label: "Flashcarduri", icon: Layers },
  quiz_mcq: { label: "Test Grilă", icon: HelpCircle },
  quiz_open: { label: "Subiect Deschis", icon: HelpCircle },
  code_exercise: { label: "Simulare", icon: Code },
  reference_list: { label: "Bibliografie", icon: BookmarkCheck },
  image: { label: "Grafic", icon: Compass },
  video: { label: "Video", icon: Film },
};

export function LessonBlockNavigator({ blocks }: LessonBlockNavigatorProps) {
  const [activeId, setActiveId] = React.useState<string>(blocks[0]?.id || "");

  React.useEffect(() => {
    if (blocks.length <= 1) return;

    const handleScroll = () => {
      const scrollY = window.scrollY + 140;
      for (let i = blocks.length - 1; i >= 0; i--) {
        const el = document.getElementById(`block-${blocks[i].id}`);
        if (el && el.offsetTop <= scrollY) {
          setActiveId(blocks[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [blocks]);

  if (blocks.length <= 1) return null;

  const scrollToBlock = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(`block-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-14 z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-2.5 mb-6 bg-background/90 backdrop-blur-md border-y sm:border sm:rounded-xl shadow-xs transition-all">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 shrink-0 flex items-center gap-1.5 hidden sm:flex">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span>Secțiuni:</span>
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {blocks.map((block, idx) => {
            const config = BLOCK_CONFIG[block.type as BlockType] || {
              label: block.type,
              icon: BookOpen,
            };
            const Icon = config.icon;
            const isActive = activeId === block.id;

            return (
              <button
                key={block.id}
                type="button"
                onClick={() => scrollToBlock(block.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all select-none whitespace-nowrap cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {config.label}
                  {blocks.filter((b) => b.type === block.type).length > 1 && ` (${idx + 1})`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
