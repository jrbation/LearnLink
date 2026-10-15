import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TeacherAttendanceClient } from "./attendance-client";

export default async function TeacherAttendancePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "TEACHER") redirect("/unauthorized");

  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          student: { select: { id: true, name: true, email: true, avatar: true } },
        },
      },
      schedules: {
        orderBy: { startTime: "desc" },
        include: {
          attendance: true,
        },
      },
    },
    orderBy: { name: "asc" },
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
      <TeacherAttendanceClient classes={classes} />
    </DashboardShell>
  );
}
