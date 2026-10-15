import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StudentLessonsClient } from "./lessons-client";

interface PageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function StudentLessonsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "STUDENT") redirect("/unauthorized");

  const { classId } = await searchParams;

  // Get enrolled classes
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id, status: "ACTIVE" },
    select: {
      class: {
        select: { id: true, name: true, subject: true },
      },
    },
  });

  const enrolledClassIds = enrollments.map((e) => e.class.id);

  const lessons = await prisma.lesson.findMany({
    where: {
      status: "PUBLISHED",
      classId: { in: enrolledClassIds },
      ...(classId ? { classId } : {}),
    },
    include: {
      class: { select: { id: true, name: true, subject: true } },
      materials: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <DashboardShell
      role="STUDENT"
      user={{
        name: session.user.name || "Student",
        email: session.user.email || "",
        role: "STUDENT",
      }}
    >
      <StudentLessonsClient
        initialLessons={lessons}
        classes={enrollments.map((e) => e.class)}
        selectedClassId={classId}
      />
    </DashboardShell>
  );
}
