import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ParentAnnouncementsClient } from "./announcements-client";

export default async function ParentAnnouncementsPage() {
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
            select: { classId: true },
          },
        },
      },
    },
  });

  const children = parentLinks.map((p) => ({
    id: p.child.id,
    name: p.child.name,
    classIds: p.child.enrollments.map((e) => e.classId),
  }));

  const allClassIds = Array.from(new Set(children.flatMap((c) => c.classIds)));

  const announcements = await prisma.announcement.findMany({
    where: {
      targetAudience: { in: ["all", "parents"] },
      classId: { in: allClassIds },
    },
    include: {
      class: { select: { id: true, name: true, subject: true } },
      teacher: { select: { name: true, email: true } },
    },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
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
      <ParentAnnouncementsClient
        childrenList={children}
        initialAnnouncements={announcements}
      />
    </DashboardShell>
  );
}
