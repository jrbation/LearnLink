import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ParentDashboardClient } from "./parent-client";

export default async function ParentDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") redirect("/auth/signin");

  const parentId = session.user.id;

  // Get linked children
  const childLinks = await prisma.parentChild.findMany({
    where: { parentId, status: "ACTIVE" },
    include: {
      child: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });

  const children = childLinks.map((l) => l.child);

  if (children.length === 0) {
    return (
      <DashboardShell user={session.user as any}>
        <div className="page-header">
          <h1>Parent Dashboard</h1>
          <p>Link a child&apos;s account to view their academic information.</p>
        </div>
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-500 mb-4">
            No linked children found. Ask your child&apos;s teacher or school administrator
            for a parent-child link code, or link using your child&apos;s registered email.
          </p>
          <a href="/dashboard/parent/link-child" className="btn btn-primary">
            Link a Child Account
          </a>
        </div>
      </DashboardShell>
    );
  }

  // Fetch data for the first child by default (client-side will switch)
  const defaultChildId = children[0].id;
  const childData = await getChildData(defaultChildId);

  return (
    <DashboardShell user={session.user as any} activeChildName={children[0].name}>
      <ParentDashboardClient
        children={children}
        initialChildData={childData}
        initialChildId={defaultChildId}
      />
    </DashboardShell>
  );
}

export async function getChildData(childId: string) {
  const [enrollments, submissions, upcomingSchedules, announcements, attendance] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId: childId, status: "ACTIVE" },
      include: {
        class: {
          include: {
            teacher: { select: { name: true } },
            _count: { select: { lessons: true, assignments: true } },
          },
        },
      },
    }),
    prisma.submission.findMany({
      where: { studentId: childId },
      include: {
        assignment: {
          select: {
            title: true, type: true, dueDate: true, totalPoints: true,
            class: { select: { name: true } },
          },
        },
        grade: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.schedule.findMany({
      where: {
        class: { enrollments: { some: { studentId: childId, status: "ACTIVE" } } },
        startTime: { gte: new Date() },
        status: "SCHEDULED",
      },
      include: { class: { select: { name: true, subject: true } } },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
    prisma.announcement.findMany({
      where: {
        class: { enrollments: { some: { studentId: childId, status: "ACTIVE" } } },
        targetAudience: { in: ["all", "parents"] },
      },
      include: {
        class: { select: { name: true } },
        teacher: { select: { name: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    prisma.attendance.findMany({
      where: { studentId: childId },
      include: { schedule: { select: { title: true, startTime: true, class: { select: { name: true } } } } },
      orderBy: { markedAt: "desc" },
      take: 10,
    }),
  ]);

  // Pending assignments (not yet submitted)
  const classIds = enrollments.map((e) => e.classId);
  const pendingAssignments = await prisma.assignment.findMany({
    where: {
      classId: { in: classIds },
      status: "PUBLISHED",
      submissions: { none: { studentId: childId } },
    },
    include: { class: { select: { name: true } } },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  return {
    enrollments: JSON.parse(JSON.stringify(enrollments)),
    submissions: JSON.parse(JSON.stringify(submissions)),
    upcomingSchedules: JSON.parse(JSON.stringify(upcomingSchedules)),
    announcements: JSON.parse(JSON.stringify(announcements)),
    attendance: JSON.parse(JSON.stringify(attendance)),
    pendingAssignments: JSON.parse(JSON.stringify(pendingAssignments)),
  };
}
