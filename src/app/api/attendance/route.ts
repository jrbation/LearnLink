import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { attendanceSchema } from "@/lib/validations";
import { notifyParentsOfStudent, createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scheduleId = req.nextUrl.searchParams.get("scheduleId");
  const classId = req.nextUrl.searchParams.get("classId");
  const studentId = req.nextUrl.searchParams.get("studentId");

  if (session.user.role === "TEACHER") {
    if (scheduleId) {
      const records = await prisma.attendance.findMany({
        where: { scheduleId },
        include: {
          student: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });
      return NextResponse.json({ records });
    }

    if (classId) {
      const records = await prisma.attendance.findMany({
        where: { schedule: { classId } },
        include: {
          student: { select: { id: true, name: true, email: true } },
          schedule: { select: { id: true, title: true, startTime: true } },
        },
        orderBy: { markedAt: "desc" },
      });
      return NextResponse.json({ records });
    }

    return NextResponse.json({ error: "Missing scheduleId or classId" }, { status: 400 });
  }

  if (session.user.role === "STUDENT") {
    const records = await prisma.attendance.findMany({
      where: { studentId: session.user.id },
      include: {
        schedule: {
          include: {
            class: { select: { id: true, name: true, subject: true } },
          },
        },
      },
      orderBy: { markedAt: "desc" },
    });
    return NextResponse.json({ records });
  }

  if (session.user.role === "PARENT") {
    const targetStudentId = studentId;
    if (!targetStudentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // Verify parent-child relationship
    const link = await prisma.parentChild.findFirst({
      where: { parentId: session.user.id, childId: targetStudentId, status: "ACTIVE" },
    });
    if (!link) return NextResponse.json({ error: "Unauthorized access to child" }, { status: 403 });

    const records = await prisma.attendance.findMany({
      where: { studentId: targetStudentId },
      include: {
        schedule: {
          include: {
            class: { select: { id: true, name: true, subject: true } },
          },
        },
      },
      orderBy: { markedAt: "desc" },
    });
    return NextResponse.json({ records });
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
    const result = attendanceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { scheduleId, records } = result.data;

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { class: true },
    });

    if (!schedule || schedule.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden or schedule not found" }, { status: 403 });
    }

    const results = [];
    for (const item of records) {
      const record = await prisma.attendance.upsert({
        where: {
          scheduleId_studentId: {
            scheduleId,
            studentId: item.studentId,
          },
        },
        create: {
          scheduleId,
          studentId: item.studentId,
          status: item.status,
          notes: item.notes || null,
          markedById: session.user.id,
        },
        update: {
          status: item.status,
          notes: item.notes || null,
          markedById: session.user.id,
          markedAt: new Date(),
        },
      });

      results.push(record);

      // Alert parent if marked ABSENT or LATE
      if (item.status === "ABSENT" || item.status === "LATE") {
        const student = await prisma.user.findUnique({
          where: { id: item.studentId },
          select: { name: true },
        });

        await notifyParentsOfStudent(item.studentId, {
          title: `Attendance Alert: ${item.status}`,
          message: `${student?.name || "Your child"} was marked ${item.status} for "${schedule.title}" in ${schedule.class.name}.`,
          type: "GENERAL",
          link: `/dashboard/parent/attendance`,
        });

        // Also notify the student
        await createNotification({
          userId: item.studentId,
          title: `Attendance Marked: ${item.status}`,
          message: `You were marked ${item.status} for ${schedule.title}.`,
          type: "GENERAL",
          link: `/dashboard/student/schedule`,
        });
      }
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (error: any) {
    console.error("Attendance error:", error);
    return NextResponse.json({ error: error.message || "Failed to mark attendance" }, { status: 500 });
  }
}
