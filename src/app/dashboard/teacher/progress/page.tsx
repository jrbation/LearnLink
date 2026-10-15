import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TeacherProgressClient } from "./progress-client";

export default async function TeacherProgressPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "TEACHER") redirect("/unauthorized");

  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          student: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      },
      assignments: {
        include: {
          submissions: {
            include: { grade: true },
          },
        },
      },
      schedules: {
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
      <TeacherProgressClient classes={classes} />
    </DashboardShell>
  );
}
