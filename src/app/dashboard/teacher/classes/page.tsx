import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TeacherClassesClient } from "./classes-client";

export default async function TeacherClassesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "TEACHER") redirect("/unauthorized");

  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: {
        select: {
          enrollments: true,
          lessons: true,
          assignments: true,
          schedules: true,
        },
      },
      enrollments: {
        include: {
          student: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        take: 5,
      },
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
      <TeacherClassesClient initialClasses={classes} />
    </DashboardShell>
  );
}
