import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StudentClassesClient } from "./classes-client";

export default async function StudentClassesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "STUDENT") redirect("/unauthorized");

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id, status: "ACTIVE" },
    include: {
      class: {
        include: {
          teacher: { select: { id: true, name: true, email: true, avatar: true } },
          _count: {
            select: { lessons: true, assignments: true, schedules: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
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
      <StudentClassesClient initialEnrollments={enrollments} />
    </DashboardShell>
  );
}
