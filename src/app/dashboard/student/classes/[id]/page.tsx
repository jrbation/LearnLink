import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StudentClassDetailClient } from "./class-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentClassDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "STUDENT") redirect("/unauthorized");

  const { id } = await params;

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      classId_studentId: {
        classId: id,
        studentId: session.user.id,
      },
    },
    include: {
      class: {
        include: {
          teacher: { select: { id: true, name: true, email: true, avatar: true } },
          lessons: {
            where: { status: "PUBLISHED" },
            include: { materials: true },
            orderBy: { order: "asc" },
          },
          assignments: {
            where: { status: "PUBLISHED" },
            include: {
              _count: { select: { questions: true } },
              submissions: {
                where: { studentId: session.user.id },
                include: { grade: true },
              },
            },
            orderBy: { dueDate: "asc" },
          },
          schedules: {
            orderBy: { startTime: "asc" },
          },
          announcements: {
            where: { targetAudience: { in: ["all", "students"] } },
            orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
          },
        },
      },
    },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    notFound();
  }

  return (
    <DashboardShell
      role="STUDENT"
      user={{
        name: session.user.name || "Student",
        email: session.user.email || "",
        role: "STUDENT",
      }}
    >
      <StudentClassDetailClient classData={enrollment.class} studentId={session.user.id} />
    </DashboardShell>
  );
}
