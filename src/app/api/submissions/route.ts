import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createNotification, notifyParentsOfStudent } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assignmentId = req.nextUrl.searchParams.get("assignmentId");

  if (session.user.role === "TEACHER") {
    if (!assignmentId) {
      return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { class: true },
    });

    if (!assignment || assignment.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        grade: true,
        responses: {
          include: {
            question: { include: { answerChoices: true } },
            selectedChoice: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submissions });
  }

  if (session.user.role === "STUDENT") {
    const submissions = await prisma.submission.findMany({
      where: {
        studentId: session.user.id,
        ...(assignmentId ? { assignmentId } : {}),
      },
      include: {
        assignment: { select: { id: true, title: true, totalPoints: true, type: true } },
        grade: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submissions });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { assignmentId, responses, fileUrl, fileName } = body;

    if (!assignmentId) {
      return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          include: {
            teacher: { select: { id: true, name: true } },
            enrollments: { where: { studentId: session.user.id, status: "ACTIVE" } },
          },
        },
        questions: {
          include: { answerChoices: true },
        },
      },
    });

    if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    if (assignment.class.enrollments.length === 0) {
      return NextResponse.json({ error: "You are not enrolled in this class" }, { status: 403 });
    }
    if (assignment.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Assignment is not open for submission" }, { status: 400 });
    }

    // Check existing submission
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: session.user.id,
        },
      },
    });

    if (existingSubmission && existingSubmission.status !== "DRAFT") {
      return NextResponse.json({ error: "You have already submitted this assignment" }, { status: 400 });
    }

    // Check deadlines
    const now = new Date();
    const isLate = assignment.dueDate ? now > new Date(assignment.dueDate) : false;
    if (isLate && !assignment.allowLate) {
      return NextResponse.json({ error: "Deadline has passed and late submissions are not allowed" }, { status: 400 });
    }

    // Auto-grade calculation if questions exist
    let totalScore = 0;
    let maxScore = 0;
    let allAutoGradable = assignment.questions.length > 0;

    for (const q of assignment.questions) {
      maxScore += q.points;
      if (q.type !== "MULTIPLE_CHOICE") {
        allAutoGradable = false;
      }
    }

    // Process responses
    const responseData: any[] = [];
    if (responses && Array.isArray(responses)) {
      for (const resp of responses) {
        const question = assignment.questions.find((q) => q.id === resp.questionId);
        if (question) {
          responseData.push({
            questionId: resp.questionId,
            answerText: resp.answerText || null,
            selectedChoiceId: resp.selectedChoiceId || null,
          });

          if (question.type === "MULTIPLE_CHOICE" && resp.selectedChoiceId) {
            const chosenChoice = question.answerChoices.find((c) => c.id === resp.selectedChoiceId);
            if (chosenChoice?.isCorrect) {
              totalScore += question.points;
            }
          }
        }
      }
    }

    const shouldAutoGrade = assignment.questions.length > 0 && allAutoGradable;
    const submissionStatus = shouldAutoGrade ? "GRADED" : (isLate ? "LATE" : "SUBMITTED");

    // Create or update submission
    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: session.user.id,
        },
      },
      create: {
        assignmentId,
        studentId: session.user.id,
        status: submissionStatus,
        submittedAt: now,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        responses: {
          create: responseData,
        },
      },
      update: {
        status: submissionStatus,
        submittedAt: now,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        responses: {
          deleteMany: {},
          create: responseData,
        },
      },
    });

    // If auto-graded, create Grade record immediately
    if (shouldAutoGrade) {
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 100;
      await prisma.grade.upsert({
        where: { submissionId: submission.id },
        create: {
          submissionId: submission.id,
          score: totalScore,
          maxScore,
          percentage: Math.round(percentage * 10) / 10,
          feedback: `Auto-graded quiz: ${totalScore}/${maxScore} points`,
          gradedById: assignment.class.teacher.id,
        },
        update: {
          score: totalScore,
          maxScore,
          percentage: Math.round(percentage * 10) / 10,
          feedback: `Auto-graded quiz: ${totalScore}/${maxScore} points`,
          gradedById: assignment.class.teacher.id,
        },
      });

      // Notify student
      await createNotification({
        userId: session.user.id,
        title: `Quiz Graded: ${assignment.title}`,
        message: `Your quiz was auto-graded. You scored ${totalScore}/${maxScore} (${Math.round(percentage)}%).`,
        type: "GRADE_RELEASED",
        link: `/dashboard/student/assignments/${assignment.id}`,
      });

      // Notify parent
      await notifyParentsOfStudent(session.user.id, {
        title: `New Grade: ${assignment.title}`,
        message: `${session.user.name || "Your child"} scored ${totalScore}/${maxScore} (${Math.round(percentage)}%) on ${assignment.title}.`,
        type: "GRADE_RELEASED",
        link: `/dashboard/parent/academics`,
      });
    } else {
      // Notify teacher of new submission pending review
      await createNotification({
        userId: assignment.class.teacher.id,
        title: `New Submission: ${assignment.title}`,
        message: `${session.user.name || "A student"} submitted ${assignment.title}${isLate ? " (LATE)" : ""}.`,
        type: "SUBMISSION",
        link: `/dashboard/teacher/assignments/${assignment.id}/grade`,
      });
    }

    return NextResponse.json({ submission, autoGraded: shouldAutoGrade }, { status: 201 });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit assignment" }, { status: 500 });
  }
}
