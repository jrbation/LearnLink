import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TeacherAnnouncementsClient } from "./announcements-client";

interface PageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function TeacherAnnouncementsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "TEACHER") redirect("/unauthorized");

  const { classId } = await searchParams;

  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    select: { id: true, name: true, subject: true },
    orderBy: { name: "asc" },
  });

  const announcements = await prisma.announcement.findMany({
    where: {
      teacherId: session.user.id,
      ...(classId ? { classId: classId } : {}),
    },
    include: {
      class: { select: { id: true, name: true, subject: true } },
    },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
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
      <TeacherAnnouncementsClient
        initialAnnouncements={announcements}
        classes={classes}
        selectedClassId={classId}
      />
    </DashboardShell>
  );
}
