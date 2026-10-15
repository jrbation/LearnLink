import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          enrollments: { select: { studentId: true } },
        },
      },
      materials: true,
    },
  });

  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  // Access check
  if (session.user.role === "TEACHER" && lesson.class.teacher.id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (session.user.role === "STUDENT") {
    const isEnrolled = lesson.class.enrollments.some((e) => e.studentId === session.user.id);
    if (!isEnrolled || lesson.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({ lesson });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { class: true },
  });

  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  if (lesson.class.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.lesson.update({
    where: { id },
    data: {
      title: body.title ?? lesson.title,
      description: body.description !== undefined ? body.description : lesson.description,
      content: body.content !== undefined ? body.content : lesson.content,
      status: body.status ?? lesson.status,
      publishedAt: body.status === "PUBLISHED" && !lesson.publishedAt ? new Date() : lesson.publishedAt,
    },
  });

  return NextResponse.json({ lesson: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { class: true },
  });

  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  if (lesson.class.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
