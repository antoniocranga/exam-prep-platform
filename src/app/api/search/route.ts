import { NextRequest, NextResponse } from "next/server";
import { searchKnowledgeAndBlocks } from "@/lib/search/rag-search";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "all";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 25;

  if (!query.trim()) {
    return NextResponse.json({ results: [], query: "", total: 0 });
  }

  try {
    const results = await searchKnowledgeAndBlocks(query, { filter, limit });
    return NextResponse.json({ results, query, total: results.length });
  } catch (error) {
    console.error("API /api/search error:", error);
    return NextResponse.json(
      { error: "Eroare internă la căutare RAG", details: String(error) },
      { status: 500 }
    );
  }
}
