import * as React from "react";
import { BookMarked, ExternalLink } from "lucide-react";
import { LessonBlockRow } from "@/types/database.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ReferenceItem {
  title: string;
  citation?: string;
  source_type?: string;
  url?: string;
  year?: string | number;
}

interface ReferenceListBlockProps {
  block: LessonBlockRow;
}

export function ReferenceListBlock({ block }: ReferenceListBlockProps) {
  const content = (block.content_json || {}) as Record<string, unknown>;
  const title = (content.title || "Surse & Referințe Bibliografice") as string;
  
  // Support both contract v1.0 (references array) and legacy format (items array)
  const items: ReferenceItem[] = React.useMemo(() => {
    if (Array.isArray(content.references) && content.references.length > 0) {
      return content.references.map((r: Record<string, unknown>) => ({
        title: (r.locator || r.citation || r.title || "Referință normativă") as string,
        citation: (r.citation || r.source_title || "") as string,
        url: (r.source_url || r.url || "") as string,
        source_type: (r.source_type || (r.locator ? "Legislație / Articol" : "Sursă Oficială")) as string,
      }));
    }
    if (Array.isArray(content.items) && content.items.length > 0) {
      return content.items as ReferenceItem[];
    }
    return [];
  }, [content]);

  return (
    <Card className="my-6 rounded-2xl border border-primary/20 bg-card shadow-xs">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Fără referințe asociate.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((item, idx) => (
              <li key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-sm">
                <div className="space-y-0.5">
                  <div className="font-medium text-foreground">{item.title}</div>
                  {item.citation && item.citation !== item.title && (
                    <div className="text-xs text-muted-foreground">{item.citation}</div>
                  )}
                  {item.source_type && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground uppercase font-mono">
                      {item.source_type}
                    </span>
                  )}
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-xs shrink-0 mt-1 font-medium"
                  >
                    <span>Consultă Textul</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

