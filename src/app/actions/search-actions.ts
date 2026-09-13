"use server";

import { searchKnowledgeAndBlocks, RagSearchResult } from "@/lib/search/rag-search";

export async function performRagSearchAction(
  query: string,
  filter: string = "all",
  limit: number = 25
): Promise<{ results: RagSearchResult[]; total: number; error?: string }> {
  if (!query || !query.trim()) {
    return { results: [], total: 0 };
  }

  try {
    const results = await searchKnowledgeAndBlocks(query, { filter, limit });
    return { results, total: results.length };
  } catch (err) {
    console.error("Error in performRagSearchAction:", err);
    return { results: [], total: 0, error: "Eroare la executarea căutării RAG." };
  }
}
