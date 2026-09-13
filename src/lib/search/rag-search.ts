import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { KnowledgeBaseRow, LessonRow, LessonBlockRow, ModuleRow } from "@/types/database.types";

export interface RagSearchResult {
  result_id: string;
  kind: "knowledge_base" | "lesson_block";
  title: string;
  source_type: string;
  source_category: "legea-198" | "rofuip" | "ome-3934" | "teorie" | "spete" | "altele";
  source_badge_label: string;
  citation: string;
  source_url: string;
  locator: string;
  snippet: string;
  highlighted_snippet: string;
  lesson_slug: string;
  lesson_title: string;
  module_slug: string;
  module_title: string;
  block_id: string;
  block_type: string;
  score: number;
}

// Helper to normalize Romanian diacritics for flexible fuzzy matching
export function normalizeDiacritics(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Categorize source into one of the 5 official filter categories
export function categorizeSource(
  textToAnalyze: string,
  blockType?: string
): {
  category: "legea-198" | "rofuip" | "ome-3934" | "teorie" | "spete" | "altele";
  badgeLabel: string;
} {
  const norm = normalizeDiacritics(textToAnalyze);

  if (blockType === "quiz_open" || norm.includes("speta") || norm.includes("caz practic") || norm.includes("studiu de caz")) {
    return { category: "spete", badgeLabel: "Speță & Studiu de Caz" };
  }
  if (norm.includes("rofuip") || norm.includes("ome 4183") || norm.includes("ome 5726") || norm.includes("regulament-cadru") || norm.includes("regulamentul-cadru")) {
    return { category: "rofuip", badgeLabel: "ROFUIP" };
  }
  if (norm.includes("3934") || norm.includes("evaluare nationala") || norm.includes("bacalaureat") || norm.includes("calendar scolar")) {
    return { category: "ome-3934", badgeLabel: "OME 3934/2026" };
  }
  if (
    norm.includes("bush") ||
    norm.includes("hattie") ||
    norm.includes("wiliam") ||
    norm.includes("hallinger") ||
    norm.includes("leadership") ||
    norm.includes("management educational") ||
    norm.includes("teorie")
  ) {
    return { category: "teorie", badgeLabel: "Bush & Hattie (Teorie)" };
  }
  if (norm.includes("198/2023") || norm.includes("legea 198") || norm.includes("invatamantului preuniversitar") || norm.includes("art.")) {
    return { category: "legea-198", badgeLabel: "Legea 198/2023" };
  }

  return { category: "altele", badgeLabel: "Curriculum Oficial" };
}

// Extract highlighted snippet with context window
export function createSnippet(
  fullText: string,
  query: string,
  windowSize: number = 180
): { snippet: string; highlighted: string } {
  if (!fullText) return { snippet: "", highlighted: "" };

  const cleanText = fullText.replace(/\s+/g, " ").trim();
  const normText = normalizeDiacritics(cleanText);
  const normQuery = normalizeDiacritics(query.trim());

  let matchIndex = -1;
  const queryWords = normQuery.split(/\s+/).filter((w) => w.length > 2);

  // Find position of the best matching word
  for (const word of queryWords) {
    const idx = normText.indexOf(word);
    if (idx !== -1) {
      matchIndex = idx;
      break;
    }
  }

  if (matchIndex === -1) {
    matchIndex = 0;
  }

  const start = Math.max(0, matchIndex - windowSize / 2);
  const end = Math.min(cleanText.length, matchIndex + windowSize);

  let snippet = cleanText.slice(start, end).trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < cleanText.length) snippet = snippet + "...";

  // Build highlighted HTML snippet
  let highlighted = snippet;
  if (queryWords.length > 0) {
    const escapedWords = queryWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");
    highlighted = snippet.replace(regex, `<mark class="bg-amber-500/25 text-foreground px-1 py-0.5 rounded font-semibold">$1</mark>`);
  }

  return { snippet, highlighted };
}

// Get Supabase client safely with fallback
async function getSupabase() {
  try {
    return await createServerClient();
  } catch {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
}

export async function searchKnowledgeAndBlocks(
  query: string,
  options?: { filter?: string; limit?: number }
): Promise<RagSearchResult[]> {
  const queryClean = query.trim();
  if (!queryClean) return [];

  const limit = options?.limit || 25;
  const activeFilter = options?.filter || "all";
  const supabase = await getSupabase();
  const results: RagSearchResult[] = [];

  const normQuery = normalizeDiacritics(queryClean);
  const queryWords = normQuery.split(/\s+/).filter((w) => w.length > 1);

  // 1. Fetch modules & lessons to build route lookup maps
  const { data: rawModules } = await supabase
    .from("modules")
    .select("id, slug, title, order_index");
  const modulesData = (rawModules as unknown as ModuleRow[]) || [];
  const moduleMap = new Map(modulesData.map((m) => [m.id, m]));

  const { data: rawLessons } = await supabase
    .from("lessons")
    .select("id, module_id, slug, title, order_index");
  const lessonsData = (rawLessons as unknown as LessonRow[]) || [];
  const lessonMap = new Map(lessonsData.map((l) => [l.id, l]));

  // 2. Search knowledge_base if available
  try {
    const { data: kbData } = await supabase
      .from("knowledge_base")
      .select("id, source_type, source_title, source_url, raw_chunk, citation, metadata")
      .limit(50);

    const rows = (kbData as unknown as KnowledgeBaseRow[]) || [];
    for (const row of rows) {
      const rawChunk = row.raw_chunk || "";
      const sourceTitle = row.source_title || "";
      const citation = row.citation || "";
      const fullText = `${sourceTitle} ${citation} ${rawChunk}`;
      const normFull = normalizeDiacritics(fullText);

      const matchedWords = queryWords.filter((w) => normFull.includes(w));
      if (matchedWords.length === 0) continue;

      const metadataObj = (row.metadata as Record<string, string> | null) || {};
      const locator = metadataObj.locator || "";
      const { category, badgeLabel } = categorizeSource(fullText);

      if (activeFilter !== "all" && category !== activeFilter) {
        continue;
      }

      const { snippet, highlighted } = createSnippet(rawChunk, queryClean);
      const score = 1.0 + matchedWords.length * 0.2;

      results.push({
        result_id: row.id,
        kind: "knowledge_base",
        title: sourceTitle || "Sursă Oficială",
        source_type: row.source_type || "legislatie",
        source_category: category,
        source_badge_label: badgeLabel,
        citation: citation || "Legislație națională",
        source_url: row.source_url || "https://legislatie.just.ro/",
        locator,
        snippet,
        highlighted_snippet: highlighted,
        lesson_slug: "",
        lesson_title: "",
        module_slug: "",
        module_title: "",
        block_id: "",
        block_type: "knowledge_base",
        score,
      });
    }
  } catch (err) {
    console.error("Note: knowledge_base direct query:", err);
  }

  // 3. Search lesson_blocks
  try {
    const { data: rawBlocks } = await supabase
      .from("lesson_blocks")
      .select("id, lesson_id, type, content_json");

    const blocks = (rawBlocks as unknown as LessonBlockRow[]) || [];

    for (const lb of blocks) {
      const lesson = lessonMap.get(lb.lesson_id);
      const parentModule = lesson?.module_id ? moduleMap.get(lesson.module_id) : undefined;
      const contentJson = (lb.content_json as Record<string, unknown>) || {};

      // Extract all searchable text and citations based on block type
      let searchableText = "";
      let primaryLocator = "";
      let primaryCitation = "";
      let primaryUrl = "";

      // Citations array if present
      const citations = (contentJson.citations || []) as Array<{ locator?: string; citation?: string; source_url?: string }>;
      if (citations.length > 0) {
        primaryLocator = citations[0].locator || "";
        primaryCitation = citations[0].citation || "";
        primaryUrl = citations[0].source_url || "";
      }

      // Type-specific content parsing
      if (lb.type === "markdown") {
        const md = (contentJson.markdown as string) || (contentJson.content as string) || "";
        searchableText = md;
      } else if (lb.type === "callout") {
        const title = (contentJson.title as string) || "";
        const body = (contentJson.body as string) || (contentJson.content as string) || "";
        searchableText = `${title}: ${body}`;
      } else if (lb.type === "reference_list") {
        const refs = (contentJson.references || []) as Array<{ locator?: string; citation?: string; source_url?: string }>;
        searchableText = refs.map((r) => `${r.locator || ""} ${r.citation || ""}`).join(" ");
        if (refs.length > 0 && !primaryLocator) {
          primaryLocator = refs[0].locator || "";
          primaryCitation = refs[0].citation || "";
          primaryUrl = refs[0].source_url || "";
        }
      } else if (lb.type === "quiz_open") {
        const prompt = (contentJson.prompt as string) || (contentJson.question as string) || "";
        const rubric = Array.isArray(contentJson.rubric) ? contentJson.rubric.join(" ") : "";
        const exemplar = (contentJson.exemplar_answer as string) || "";
        searchableText = `Speță / Studiu de caz: ${prompt} Evaluare: ${rubric} ${exemplar}`;
        if (!primaryLocator) primaryLocator = "Studiu de Caz / Speță Legală";
      } else if (lb.type === "quiz_mcq") {
        const question = (contentJson.question as string) || "";
        const explanation = (contentJson.explanation as string) || "";
        const options = Array.isArray(contentJson.options)
          ? contentJson.options.map((o: { text?: string }) => o.text || "").join(" ")
          : "";
        searchableText = `Întrebare Quiz: ${question} ${options} Explicație: ${explanation}`;
      } else if (lb.type === "flashcard_set") {
        const title = (contentJson.title as string) || "";
        const cards = Array.isArray(contentJson.cards)
          ? contentJson.cards.map((c: { front?: string; back?: string }) => `${c.front || ""} ${c.back || ""}`).join(" ")
          : "";
        searchableText = `Flashcards: ${title} ${cards}`;
      } else if (lb.type === "code_exercise") {
        const prompt = (contentJson.prompt as string) || "";
        searchableText = `Exercițiu practic: ${prompt}`;
      } else {
        searchableText = JSON.stringify(contentJson);
      }

      // Check for match
      const combinedSearchContext = `${lesson?.title || ""} ${searchableText} ${primaryCitation} ${primaryLocator}`;
      const normContext = normalizeDiacritics(combinedSearchContext);

      const matchedWords = queryWords.filter((w) => normContext.includes(w));
      if (matchedWords.length === 0) continue;

      // Determine category
      const { category, badgeLabel } = categorizeSource(combinedSearchContext, lb.type);

      // Filter check
      if (activeFilter !== "all" && category !== activeFilter) {
        continue;
      }

      // Fallback citations if empty
      if (!primaryCitation) {
        primaryCitation = lesson ? `Lecția: ${lesson.title}` : "Curriculum EduPlatform";
      }
      if (!primaryUrl) {
        primaryUrl = "https://legislatie.just.ro/Public/DetaliiDocument/271896";
      }
      if (!primaryLocator) {
        primaryLocator = `Secțiunea: ${lb.type}`;
      }

      const { snippet, highlighted } = createSnippet(searchableText, queryClean);
      const score = 0.9 + matchedWords.length * 0.25 + (normContext.includes(normQuery) ? 0.5 : 0);

      results.push({
        result_id: lb.id,
        kind: "lesson_block",
        title: lesson?.title || "Lecție Curriculum",
        source_type: lb.type,
        source_category: category,
        source_badge_label: badgeLabel,
        citation: primaryCitation,
        source_url: primaryUrl,
        locator: primaryLocator,
        snippet,
        highlighted_snippet: highlighted,
        lesson_slug: lesson?.slug || "",
        lesson_title: lesson?.title || "",
        module_slug: parentModule?.slug || "",
        module_title: parentModule?.title || "",
        block_id: lb.id,
        block_type: lb.type,
        score,
      });
    }
  } catch (err) {
    console.error("Error querying lesson_blocks:", err);
  }

  // Sort by score descending and return up to limit
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
