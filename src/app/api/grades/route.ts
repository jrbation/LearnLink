import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { gradeSchema } from "@/lib/validations";
import { createNotification, notifyParentsOfStudent } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = gradeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { submissionId, score, feedback } = result.data;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            class: true,
          },
        },
        student: { select: { id: true, name: true } },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.assignment.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not your class" }, { status: 403 });
    }

    const maxScore = submission.assignment.totalPoints || 100;
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 100;

    // Create or update grade
    const grade = await prisma.grade.upsert({
      where: { submissionId },
      create: {
        submissionId,
        score,
        maxScore,
        percentage: Math.round(percentage * 10) / 10,
        feedback: feedback || null,
        gradedById: session.user.id,
      },
      update: {
        score,
        maxScore,
        percentage: Math.round(percentage * 10) / 10,
        feedback: feedback || null,
        gradedById: session.user.id,
        gradedAt: new Date(),
      },
    });

    // Mark submission as GRADED
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "GRADED" },
    });

    // Notify student
    await createNotification({
      userId: submission.studentId,
      title: `Grade Released: ${submission.assignment.title}`,
      message: `Your teacher graded ${submission.assignment.title}. Score: ${score}/${maxScore} (${Math.round(percentage)}%).`,
      type: "GRADE_RELEASED",
      link: `/dashboard/student/assignments/${submission.assignmentId}`,
    });

    // Notify parent
    await notifyParentsOfStudent(submission.studentId, {
      title: `Academic Grade: ${submission.assignment.title}`,
      message: `${submission.student.name || "Your child"} received a score of ${score}/${maxScore} (${Math.round(percentage)}%) in ${submission.assignment.class.name}.`,
      type: "GRADE_RELEASED",
      link: `/dashboard/parent/academics`,
    });

    return NextResponse.json({ grade }, { status: 200 });
  } catch (error: any) {
    console.error("Grading error:", error);
    return NextResponse.json({ error: error.message || "Failed to grade submission" }, { status: 500 });
  }
}
