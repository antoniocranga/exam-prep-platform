import * as React from "react";
import Image from "next/image";
import { Video, Image as ImageIcon } from "lucide-react";
import { LessonBlockRow } from "@/types/database.types";
import { Card } from "@/components/ui/card";

export function ImageBlock({ block }: { block: LessonBlockRow }) {
  const content = (block.content_json || {}) as Record<string, unknown>;
  const url = (content.url || content.src || "") as string;
  const alt = (content.alt || content.caption || "Imagine lecție") as string;
  const caption = (content.caption || "") as string;

  if (!url) {
    return (
      <div className="my-6 p-6 rounded-xl border border-dashed flex flex-col items-center justify-center text-muted-foreground text-sm">
        <ImageIcon className="h-6 w-6 mb-2" />
        <span>Imagine indisponibilă</span>
      </div>
    );
  }

  return (
    <figure className="my-6 flex flex-col items-center">
      <div className="overflow-hidden rounded-xl border bg-muted/30 relative w-full max-w-2xl h-80">
        <Image
          src={url}
          alt={alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function VideoBlock({ block }: { block: LessonBlockRow }) {
  const content = (block.content_json || {}) as Record<string, unknown>;
  const url = (content.url || content.src || "") as string;
  const title = (content.title || "Video lecție") as string;

  if (!url) {
    return (
      <div className="my-6 p-6 rounded-xl border border-dashed flex flex-col items-center justify-center text-muted-foreground text-sm">
        <Video className="h-6 w-6 mb-2" />
        <span>Video indisponibil</span>
      </div>
    );
  }

  return (
    <Card className="my-6 overflow-hidden border">
      <div className="aspect-video w-full">
        <iframe
          src={url}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    </Card>
  );
}
