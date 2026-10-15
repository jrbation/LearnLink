import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scheduleSchema } from "@/lib/validations";
import { notifyClassStudents, notifyClassParents } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = req.nextUrl.searchParams.get("classId");
  const childId = req.nextUrl.searchParams.get("childId");

  if (session.user.role === "TEACHER") {
    const where: any = { class: { teacherId: session.user.id } };
    if (classId) where.classId = classId;

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, subject: true } },
        _count: { select: { attendance: true } },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ schedules });
  }

  if (session.user.role === "STUDENT") {
    const where: any = {
      class: { enrollments: { some: { studentId: session.user.id, status: "ACTIVE" } } },
    };
    if (classId) where.classId = classId;

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, subject: true } },
        attendance: { where: { studentId: session.user.id } },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ schedules });
  }

  if (session.user.role === "PARENT") {
    // Parent can specify childId or get all active linked children's schedules
    const targetStudentId = childId;
    const parentLinks = await prisma.parentChild.findMany({
      where: {
        parentId: session.user.id,
        status: "ACTIVE",
        ...(targetStudentId ? { childId: targetStudentId } : {}),
      },
      select: { childId: true },
    });

    const childIds = parentLinks.map((p) => p.childId);

    const schedules = await prisma.schedule.findMany({
      where: {
        class: { enrollments: { some: { studentId: { in: childIds }, status: "ACTIVE" } } },
      },
      include: {
        class: { select: { id: true, name: true, subject: true } },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ schedules });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = scheduleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { classId, title, description, startTime, endTime, meetingLink } = result.data;

    // Verify teacher owns the class
    const cls = await prisma.class.findFirst({
      where: { id: classId, teacherId: session.user.id },
    });
    if (!cls) return NextResponse.json({ error: "Class not found or access denied" }, { status: 404 });

    const schedule = await prisma.schedule.create({
      data: {
        classId,
        title,
        description: description || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        meetingLink: meetingLink || null,
        status: "SCHEDULED",
      },
      include: {
        class: { select: { name: true } },
      },
    });

    const formattedTime = new Date(startTime).toLocaleString();

    // Notify students
    await notifyClassStudents(classId, {
      title: `Upcoming Class: ${title}`,
      message: `A new session for ${cls.name} has been scheduled for ${formattedTime}.`,
      type: "SCHEDULE_CHANGE",
      link: `/dashboard/student/schedule`,
    });

    // Notify parents
    await notifyClassParents(classId, {
      title: `Child Class Scheduled: ${title}`,
      message: `A session for ${cls.name} is scheduled on ${formattedTime}.`,
      type: "SCHEDULE_CHANGE",
      link: `/dashboard/parent/schedule`,
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error: any) {
    console.error("Schedule error:", error);
    return NextResponse.json({ error: error.message || "Failed to create schedule" }, { status: 500 });
  }
}
