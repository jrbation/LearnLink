import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TeacherLessonsClient } from "./lessons-client";

interface PageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function TeacherLessonsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "TEACHER") redirect("/unauthorized");

  const { classId } = await searchParams;

  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    select: { id: true, name: true, subject: true },
    orderBy: { name: "asc" },
  });

  const lessons = await prisma.lesson.findMany({
    where: {
      class: { teacherId: session.user.id },
      ...(classId ? { classId } : {}),
    },
    include: {
      class: { select: { id: true, name: true, subject: true } },
      materials: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell
      role="TEACHER"
      user={{
        name: session.user.name || "Teacher",
        email: session.user.email || "",
        role: "TEACHER",
      }}
    >
      <TeacherLessonsClient
        initialLessons={lessons}
        classes={classes}
        selectedClassId={classId}
      />
    </DashboardShell>
  );
}
