import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ParentProgressClient } from "./progress-client";

export default async function ParentProgressPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "PARENT") redirect("/unauthorized");

  const parentLinks = await prisma.parentChild.findMany({
    where: { parentId: session.user.id, status: "ACTIVE" },
    include: {
      child: {
        include: {
          enrollments: {
            where: { status: "ACTIVE" },
            include: {
              class: {
                include: {
                  teacher: { select: { name: true } },
                  assignments: {
                    include: {
                      submissions: {
                        include: { grade: true },
                      },
                    },
                  },
                },
              },
            },
          },
          attendanceRecords: {
            include: {
              schedule: {
                include: {
                  class: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <DashboardShell
      role="PARENT"
      user={{
        name: session.user.name || "Parent",
        email: session.user.email || "",
        role: "PARENT",
      }}
    >
      <ParentProgressClient parentLinks={parentLinks} />
    </DashboardShell>
  );
}
