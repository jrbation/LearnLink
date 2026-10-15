import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StudentQuizRunnerClient } from "./quiz-runner-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentQuizPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "STUDENT") redirect("/unauthorized");

  const { id } = await params;

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          enrollments: {
            where: { studentId: session.user.id, status: "ACTIVE" },
          },
        },
      },
      questions: {
        orderBy: { order: "asc" },
        include: {
          answerChoices: { orderBy: { order: "asc" } },
        },
      },
      submissions: {
        where: { studentId: session.user.id },
        include: {
          grade: true,
          responses: true,
        },
      },
    },
  });

  if (!assignment || assignment.class.enrollments.length === 0 || assignment.status !== "PUBLISHED") {
    notFound();
  }

  const existingSubmission = assignment.submissions[0] || null;
  const isGraded = existingSubmission?.status === "GRADED";

  // If not graded yet, hide isCorrect from choices to prevent inspecting frontend DOM
  const sanitizedQuestions = assignment.questions.map((q) => ({
    ...q,
    answerChoices: q.answerChoices.map((c) => ({
      id: c.id,
      text: c.text,
      order: c.order,
      isCorrect: isGraded ? c.isCorrect : false,
    })),
  }));

  return (
    <DashboardShell
      role="STUDENT"
      user={{
        name: session.user.name || "Student",
        email: session.user.email || "",
        role: "STUDENT",
      }}
    >
      <StudentQuizRunnerClient
        assignment={{
          ...assignment,
          questions: sanitizedQuestions,
        }}
        existingSubmission={existingSubmission}
      />
    </DashboardShell>
  );
}
