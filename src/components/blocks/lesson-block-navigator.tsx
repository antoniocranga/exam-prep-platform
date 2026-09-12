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
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { BlockType, LessonBlockRow } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const activeIndex = blocks.findIndex((b) => b.id === activeId);

  React.useEffect(() => {
    if (blocks.length <= 1) return;

    const handleScroll = () => {
      const scrollY = window.scrollY + 160;
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

  const handleNext = () => {
    const nextIdx = activeIndex < blocks.length - 1 ? activeIndex + 1 : activeIndex;
    scrollToBlock(blocks[nextIdx].id);
  };

  const handlePrev = () => {
    const prevIdx = activeIndex > 0 ? activeIndex - 1 : 0;
    scrollToBlock(blocks[prevIdx].id);
  };

  return (
    <div className="sticky top-16 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 py-2.5 mb-8 bg-background/80 backdrop-blur-md border-y sm:border sm:rounded-2xl shadow-xs transition-all">
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5 px-1">
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-[11px] gap-1.5 font-semibold text-primary border-primary/20 hidden sm:flex">
            <Sparkles className="h-3 w-3" />
            <span>
              {activeIndex >= 0 ? activeIndex + 1 : 1} / {blocks.length}
            </span>
          </Badge>

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
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all select-none whitespace-nowrap cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs shadow-primary/25 font-semibold scale-[1.02]"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
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

        {/* Quick Prev / Next Jump */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={handlePrev}
            disabled={activeIndex <= 0}
            title="Secțiunea anterioară"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={handleNext}
            disabled={activeIndex >= blocks.length - 1}
            title="Secțiunea următoare"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

