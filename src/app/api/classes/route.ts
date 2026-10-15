import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { classSchema } from "@/lib/validations";
import { generateEnrollmentCode } from "@/lib/utils";

// GET: list teacher's classes
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "TEACHER") {
    const classes = await prisma.class.findMany({
      where: { teacherId: session.user.id },
      include: {
        enrollments: { where: { status: "ACTIVE" }, include: { student: { select: { id: true, name: true, email: true } } } },
        _count: { select: { lessons: true, assignments: true, schedules: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ classes });
  }

  if (session.user.role === "STUDENT") {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: session.user.id, status: "ACTIVE" },
      include: {
        class: {
          include: {
            teacher: { select: { name: true, email: true } },
            _count: { select: { lessons: true, assignments: true, schedules: true } },
          },
        },
      },
    });
    return NextResponse.json({ classes: enrollments.map((e) => e.class) });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST: create a new class (teachers only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const result = classSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const enrollmentCode = generateEnrollmentCode();

  const newClass = await prisma.class.create({
    data: {
      ...result.data,
      teacherId: session.user.id,
      enrollmentCode,
    },
  });

  return NextResponse.json({ class: newClass }, { status: 201 });
}
