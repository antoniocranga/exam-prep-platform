import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getMockExamByIdOrSlug } from "@/lib/exams/mock-exams";
import { ExamRunner } from "@/components/exams/exam-runner";

export const dynamic = "force-dynamic";

interface ExamPageProps {
  params: Promise<{
    examId: string;
  }>;
}

export async function generateMetadata({ params }: ExamPageProps): Promise<Metadata> {
  const { examId } = await params;
  const exam = await getMockExamByIdOrSlug(examId);

  if (!exam) {
    return {
      title: "Simulare Neregăsită | ExamPrep",
    };
  }

  return {
    title: `${exam.title} (180 min) | ExamPrep`,
    description: `Simulare oficială de 180 minute, 100 puncte pentru ${exam.badge_label}.`,
  };
}

export default async function ExamRunnerPage({ params }: ExamPageProps) {
  const { examId } = await params;
  const exam = await getMockExamByIdOrSlug(examId);

  if (!exam) {
    notFound();
  }

  return <ExamRunner exam={exam} />;
}
