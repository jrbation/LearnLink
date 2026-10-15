import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

// POST: student enrolls using an enrollment code
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can enroll in classes" }, { status: 403 });
  }

  const body = await req.json();
  const { code } = body;

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Enrollment code is required" }, { status: 400 });
  }

  const cls = await prisma.class.findUnique({
    where: { enrollmentCode: code.toUpperCase().trim() },
    include: { teacher: { select: { id: true, name: true } } },
  });

  if (!cls || cls.status !== "ACTIVE") {
    return NextResponse.json({ error: "Invalid or inactive enrollment code" }, { status: 404 });
  }

  // Check existing enrollment
  const existing = await prisma.enrollment.findUnique({
    where: { classId_studentId: { classId: cls.id, studentId: session.user.id } },
  });

  if (existing) {
    if (existing.status === "ACTIVE") {
      return NextResponse.json({ error: "You are already enrolled in this class" }, { status: 409 });
    }
    // Re-activate dropped enrollment
    await prisma.enrollment.update({
      where: { id: existing.id },
      data: { status: "ACTIVE" },
    });
  } else {
    await prisma.enrollment.create({
      data: { classId: cls.id, studentId: session.user.id, status: "ACTIVE" },
    });
  }

  // Notify student
  await createNotification({
    userId: session.user.id,
    title: `Enrolled in ${cls.name}`,
    message: `You have been successfully enrolled in ${cls.name} taught by ${cls.teacher.name}.`,
    type: "ENROLLMENT",
    link: `/dashboard/student/classes`,
  });

  // Notify teacher
  await createNotification({
    userId: cls.teacher.id,
    title: "New Student Enrolled",
    message: `${session.user.name} enrolled in ${cls.name}.`,
    type: "ENROLLMENT",
    link: `/dashboard/teacher/classes/${cls.id}`,
  });

  return NextResponse.json({ success: true, className: cls.name }, { status: 200 });
}
