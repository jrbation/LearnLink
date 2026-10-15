import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TeacherScheduleClient } from "./schedule-client";

interface PageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function TeacherSchedulePage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "TEACHER") redirect("/unauthorized");

  const { classId } = await searchParams;

  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    select: { id: true, name: true, subject: true },
    orderBy: { name: "asc" },
  });

  const schedules = await prisma.schedule.findMany({
    where: {
      class: { teacherId: session.user.id },
      ...(classId ? { classId } : {}),
    },
    include: {
      class: { select: { id: true, name: true, subject: true } },
      _count: { select: { attendance: true } },
    },
    orderBy: { startTime: "asc" },
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
      <TeacherScheduleClient
        initialSchedules={schedules}
        classes={classes}
        selectedClassId={classId}
      />
    </DashboardShell>
  );
}
