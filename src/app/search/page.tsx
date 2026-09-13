import * as React from "react";
import { Metadata } from "next";
import { SearchClient } from "@/components/search/search-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Căutare RAG & Legislație | ExamPrep",
  description:
    "Căutare inteligentă RAG în legislația învățământului preuniversitar (Legea 198/2023, ROFUIP, OME 3934/2026), teorii Bush & Hattie și spețe de examen.",
};

export default function SearchPage() {
  return (
    <React.Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12 space-y-6">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-md" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      }
    >
      <SearchClient />
    </React.Suspense>
  );
}
