import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TeacherGradeClient } from "./grade-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherGradePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "TEACHER") redirect("/unauthorized");

  const { id } = await params;

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          enrollments: {
            where: { status: "ACTIVE" },
            include: {
              student: {
                select: { id: true, name: true, email: true, avatar: true },
              },
            },
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
        include: {
          student: { select: { id: true, name: true, email: true, avatar: true } },
          grade: true,
          responses: {
            include: {
              question: true,
              selectedChoice: true,
            },
          },
        },
      },
    },
  });

  if (!assignment || assignment.class.teacherId !== session.user.id) {
    notFound();
  }

  return (
    <DashboardShell
      role="TEACHER"
      user={{
        name: session.user.name || "Teacher",
        email: session.user.email || "",
        role: "TEACHER",
      }}
    >
      <TeacherGradeClient assignment={assignment} />
    </DashboardShell>
  );
}
