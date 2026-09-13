import { notFound } from "next/navigation";
import { getMockExamByIdOrSlug } from "@/lib/exams/mock-exams";
import { ExamResultsView } from "@/components/exams/exam-results-view";
import type { Metadata } from "next";

interface ExamResultsPageProps {
  params: Promise<{
    examId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ExamResultsPageProps): Promise<Metadata> {
  const { examId } = await params;
  const exam = await getMockExamByIdOrSlug(examId);

  if (!exam) {
    return {
      title: "Rezultate Examen Nedisponibile | Verificat.xyz",
    };
  }

  return {
    title: `Rezultate & Autoevaluare Barem — ${exam.title} | Verificat.xyz`,
    description: `Raport diagnostic detaliat, autoevaluare interactivă a speței manageriale pe rubrică și profil de competențe pentru ${exam.title}.`,
  };
}

export default async function ExamResultsPage({ params }: ExamResultsPageProps) {
  const { examId } = await params;
  const exam = await getMockExamByIdOrSlug(examId);

  if (!exam) {
    notFound();
  }

  return <ExamResultsView exam={exam} />;
}
