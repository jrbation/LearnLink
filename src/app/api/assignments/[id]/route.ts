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

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          enrollments: { select: { studentId: true } },
        },
      },
      questions: {
        orderBy: { order: "asc" },
        include: {
          answerChoices: {
            orderBy: { order: "asc" },
          },
        },
      },
      submissions: session.user.role === "TEACHER"
        ? {
            include: {
              student: { select: { id: true, name: true, email: true, avatar: true } },
              grade: true,
              responses: true,
            },
            orderBy: { submittedAt: "desc" },
          }
        : {
            where: { studentId: session.user.id },
            include: {
              grade: true,
              responses: true,
            },
          },
    },
  });

  if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

  // Student check: enrolled & published
  if (session.user.role === "STUDENT") {
    const isEnrolled = assignment.class.enrollments.some((e) => e.studentId === session.user.id);
    if (!isEnrolled || assignment.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If student hasn't had their submission graded yet, don't expose isCorrect
    const studentSub = assignment.submissions[0];
    const isGraded = studentSub?.status === "GRADED";

    if (!isGraded) {
      assignment.questions = assignment.questions.map((q) => ({
        ...q,
        answerChoices: q.answerChoices.map((c) => ({
          ...c,
          isCorrect: false, // Hide correct answers until graded
        })),
      }));
    }
  }

  // Teacher check: owner
  if (session.user.role === "TEACHER" && assignment.class.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ assignment });
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

  const existing = await prisma.assignment.findUnique({
    where: { id },
    include: { class: true },
  });

  if (!existing) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  if (existing.class.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        description: body.description !== undefined ? body.description : existing.description,
        instructions: body.instructions !== undefined ? body.instructions : existing.instructions,
        type: body.type ?? existing.type,
        totalPoints: body.totalPoints !== undefined ? Number(body.totalPoints) : existing.totalPoints,
        dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : existing.dueDate,
        timeLimitMinutes: body.timeLimitMinutes !== undefined ? (body.timeLimitMinutes ? Number(body.timeLimitMinutes) : null) : existing.timeLimitMinutes,
        allowLate: body.allowLate !== undefined ? Boolean(body.allowLate) : existing.allowLate,
        status: body.status ?? existing.status,
        publishDate: body.status === "PUBLISHED" && !existing.publishDate ? new Date() : existing.publishDate,
      },
    });

    return NextResponse.json({ assignment: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update assignment" }, { status: 500 });
  }
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

  const existing = await prisma.assignment.findUnique({
    where: { id },
    include: { class: true },
  });

  if (!existing) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  if (existing.class.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.assignment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
