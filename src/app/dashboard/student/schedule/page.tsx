import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StudentScheduleClient } from "./schedule-client";

export default async function StudentSchedulePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "STUDENT") redirect("/unauthorized");

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id, status: "ACTIVE" },
    select: { classId: true },
  });

  const enrolledClassIds = enrollments.map((e) => e.classId);

  const schedules = await prisma.schedule.findMany({
    where: {
      classId: { in: enrolledClassIds },
    },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          subject: true,
          teacher: { select: { name: true } },
        },
      },
      attendance: {
        where: { studentId: session.user.id },
      },
    },
    orderBy: { startTime: "asc" },
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
      <StudentScheduleClient schedules={schedules} />
    </DashboardShell>
  );
}
