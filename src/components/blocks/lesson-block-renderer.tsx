import * as React from "react";
import { BlockType, LessonBlockRow } from "@/types/database.types";
import { TextBlock } from "@/components/blocks/text-block";
import { MarkdownBlock } from "@/components/blocks/markdown-block";
import { CalloutBlock } from "@/components/blocks/callout-block";
import { ReferenceListBlock } from "@/components/blocks/reference-list-block";
import { ImageBlock, VideoBlock } from "@/components/blocks/media-blocks";
import { QuizOpenBlock } from "@/components/blocks/quiz-open-block";
import {
  QuizMcqPlaceholder,
  FlashcardSetPlaceholder,
  CodeExercisePlaceholder,
} from "@/components/blocks/runners-placeholder";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export interface LessonBlockRendererProps {
  block: LessonBlockRow;
}

// Map each block type directly to its dedicated renderer component
const BLOCK_RENDERERS: Record<
  BlockType,
  React.ComponentType<{ block: LessonBlockRow }>
> = {
  text: TextBlock,
  markdown: MarkdownBlock,
  callout: CalloutBlock,
  reference_list: ReferenceListBlock,
  image: ImageBlock,
  video: VideoBlock,
  quiz_open: QuizOpenBlock,
  quiz_mcq: QuizMcqPlaceholder,
  flashcard_set: FlashcardSetPlaceholder,
  code_exercise: CodeExercisePlaceholder,
};

function FallbackBlock({ block }: { block: LessonBlockRow }) {
  return (
    <Card className="my-4 border-dashed border-amber-500/30 bg-amber-500/5">
      <CardHeader className="flex flex-row items-center gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
        <div>
          <CardTitle className="text-sm font-semibold">
            Tip bloc necunoscut: {block.type}
          </CardTitle>
          <CardDescription className="text-xs">
            Acest tip de conținut este în curs de implementare.
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

/**
 * Generic LessonBlockRenderer dispatcher component.
 * Dispatches cleanly on block.type to the appropriate sub-component.
 * Adding a new block type requires zero changes to existing type renderers.
 */
export function LessonBlockRenderer({ block }: LessonBlockRendererProps) {
  const Component = BLOCK_RENDERERS[block.type as BlockType] ?? FallbackBlock;
  return <Component block={block} />;
}
