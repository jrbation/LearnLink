import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { lessonSchema } from "@/lib/validations";
import { notifyClassStudents } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = req.nextUrl.searchParams.get("classId");

  if (session.user.role === "TEACHER") {
    const where: any = { class: { teacherId: session.user.id } };
    if (classId) where.classId = classId;
    const lessons = await prisma.lesson.findMany({
      where, include: { class: { select: { name: true } }, materials: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ lessons });
  }

  if (session.user.role === "STUDENT") {
    const where: any = {
      status: "PUBLISHED",
      class: { enrollments: { some: { studentId: session.user.id, status: "ACTIVE" } } },
    };
    if (classId) where.classId = classId;
    const lessons = await prisma.lesson.findMany({
      where, include: { class: { select: { name: true } }, materials: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ lessons });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const result = lessonSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  // Verify ownership
  const cls = await prisma.class.findFirst({ where: { id: result.data.classId, teacherId: session.user.id } });
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const lesson = await prisma.lesson.create({
    data: {
      classId: result.data.classId,
      title: result.data.title,
      description: result.data.description || null,
      content: result.data.content || null,
      status: result.data.status || "DRAFT",
      publishedAt: result.data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  if (lesson.status === "PUBLISHED") {
    await notifyClassStudents(lesson.classId, {
      title: `New Lesson: ${lesson.title}`,
      message: `A new lesson "${lesson.title}" has been published in ${cls.name}.`,
      type: "GENERAL",
      link: `/dashboard/student/lessons`,
    });
  }

  return NextResponse.json({ lesson }, { status: 201 });
}
