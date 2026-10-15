import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StudentGradesClient } from "./grades-client";

export default async function StudentGradesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "STUDENT") redirect("/unauthorized");

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id, status: "ACTIVE" },
    include: {
      class: {
        select: { id: true, name: true, subject: true },
      },
    },
  });

  const submissions = await prisma.submission.findMany({
    where: {
      studentId: session.user.id,
      status: "GRADED",
    },
    include: {
      assignment: {
        include: {
          class: { select: { id: true, name: true, subject: true } },
        },
      },
      grade: true,
    },
    orderBy: { submittedAt: "desc" },
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
      <StudentGradesClient
        submissions={submissions}
        classes={enrollments.map((e) => e.class)}
      />
    </DashboardShell>
  );
}
