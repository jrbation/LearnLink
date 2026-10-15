import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TeacherClassDetailClient } from "./class-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherClassDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "TEACHER") redirect("/unauthorized");

  const { id } = await params;

  const classData = await prisma.class.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          student: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: { enrolledAt: "desc" },
      },
      lessons: {
        include: { materials: true },
        orderBy: { order: "asc" },
      },
      assignments: {
        include: {
          _count: { select: { submissions: true, questions: true } },
          submissions: {
            include: { grade: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      schedules: {
        orderBy: { startTime: "asc" },
      },
      announcements: {
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!classData || classData.teacherId !== session.user.id) {
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
      <TeacherClassDetailClient initialClass={classData} />
    </DashboardShell>
  );
}
