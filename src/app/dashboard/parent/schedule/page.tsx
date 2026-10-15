import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ParentScheduleClient } from "./schedule-client";

export default async function ParentSchedulePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "PARENT") redirect("/unauthorized");

  const parentLinks = await prisma.parentChild.findMany({
    where: { parentId: session.user.id, status: "ACTIVE" },
    include: {
      child: {
        select: {
          id: true,
          name: true,
          enrollments: {
            where: { status: "ACTIVE" },
            include: {
              class: {
                include: {
                  teacher: { select: { name: true } },
                  schedules: {
                    include: {
                      attendance: true,
                    },
                    orderBy: { startTime: "asc" },
                  },
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
      <ParentScheduleClient parentLinks={parentLinks} />
    </DashboardShell>
  );
}
