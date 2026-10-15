import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const childId = req.nextUrl.searchParams.get("childId");
  if (!childId) {
    return NextResponse.json({ error: "childId is required" }, { status: 400 });
  }

  // Verify parent-child link
  const link = await prisma.parentChild.findFirst({
    where: { parentId: session.user.id, childId, status: "ACTIVE" },
  });

  if (!link) {
    return NextResponse.json({ error: "Unauthorized - child not linked" }, { status: 403 });
  }

  // Fetch child data
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

  return NextResponse.json({
    enrollments,
    submissions,
    upcomingSchedules,
    announcements,
    attendance,
    pendingAssignments,
  });
}
