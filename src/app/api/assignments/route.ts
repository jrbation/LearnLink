import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyClassStudents } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = req.nextUrl.searchParams.get("classId");

  if (session.user.role === "TEACHER") {
    const where: any = { class: { teacherId: session.user.id } };
    if (classId) where.classId = classId;

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, subject: true } },
        _count: { select: { submissions: true, questions: true } },
        questions: {
          select: { id: true, type: true, points: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assignments });
  }

  if (session.user.role === "STUDENT") {
    const where: any = {
      status: "PUBLISHED",
      class: { enrollments: { some: { studentId: session.user.id, status: "ACTIVE" } } },
    };
    if (classId) where.classId = classId;

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, subject: true } },
        submissions: {
          where: { studentId: session.user.id },
          include: { grade: true },
        },
        _count: { select: { questions: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ assignments });
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
    const {
      classId,
      title,
      description,
      instructions,
      type,
      totalPoints,
      dueDate,
      timeLimitMinutes,
      allowLate,
      status,
      questions,
    } = body;

    if (!classId || !title || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cls = await prisma.class.findFirst({
      where: { id: classId, teacherId: session.user.id },
    });
    if (!cls) return NextResponse.json({ error: "Class not found or access denied" }, { status: 404 });

    const assignment = await prisma.assignment.create({
      data: {
        classId,
        title,
        description: description || null,
        instructions: instructions || null,
        type: type || "ASSIGNMENT",
        totalPoints: Number(totalPoints) || 100,
        dueDate: dueDate ? new Date(dueDate) : null,
        publishDate: status === "PUBLISHED" ? new Date() : null,
        timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
        allowLate: Boolean(allowLate),
        status: status || "DRAFT",
        questions: questions && Array.isArray(questions)
          ? {
              create: questions.map((q: any, qIdx: number) => ({
                text: q.text,
                type: q.type || "MULTIPLE_CHOICE",
                points: Number(q.points) || 1,
                order: qIdx,
                answerChoices: q.answerChoices && Array.isArray(q.answerChoices)
                  ? {
                      create: q.answerChoices.map((c: any, cIdx: number) => ({
                        text: c.text,
                        isCorrect: Boolean(c.isCorrect),
                        order: cIdx,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        questions: {
          include: { answerChoices: true },
        },
      },
    });

    if (assignment.status === "PUBLISHED") {
      await notifyClassStudents(classId, {
        title: `New ${assignment.type}: ${assignment.title}`,
        message: `A new ${assignment.type.toLowerCase()} "${assignment.title}" has been published in ${cls.name}. Due: ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No deadline"}.`,
        type: "ASSIGNMENT_DUE",
        link: `/dashboard/student/assignments/${assignment.id}`,
      });
    }

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error: any) {
    console.error("Assignment creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create assignment" }, { status: 500 });
  }
}
