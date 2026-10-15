import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StudentAssignmentsClient } from "./assignments-client";

export default async function StudentAssignmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "STUDENT") redirect("/unauthorized");

  // Get enrolled classes
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id, status: "ACTIVE" },
    select: {
      class: { select: { id: true, name: true, subject: true } },
    },
  });

  const enrolledClassIds = enrollments.map((e) => e.class.id);

  const assignments = await prisma.assignment.findMany({
    where: {
      status: "PUBLISHED",
      classId: { in: enrolledClassIds },
    },
    include: {
      class: { select: { id: true, name: true, subject: true } },
      _count: { select: { questions: true } },
      submissions: {
        where: { studentId: session.user.id },
        include: { grade: true },
      },
    },
    orderBy: { dueDate: "asc" },
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
      <StudentAssignmentsClient
        initialAssignments={assignments}
        classes={enrollments.map((e) => e.class)}
      />
    </DashboardShell>
  );
}
