import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { classSchema } from "@/lib/validations";

// GET: get single class details
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      enrollments: {
        where: { status: "ACTIVE" },
        include: { student: { select: { id: true, name: true, email: true } } },
      },
      lessons: { orderBy: { order: "asc" } },
      assignments: { orderBy: { createdAt: "desc" } },
      schedules: { orderBy: { startTime: "desc" } },
      announcements: { orderBy: { publishedAt: "desc" }, take: 5 },
      _count: { select: { enrollments: true, lessons: true, assignments: true } },
    },
  });

  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  // Authorization: teacher who owns or enrolled student
  if (session.user.role === "TEACHER" && cls.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.user.role === "STUDENT") {
    const enrolled = cls.enrollments.some((e) => e.studentId === session.user.id);
    if (!enrolled) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ class: cls });
}

// PUT: update class
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const cls = await prisma.class.findFirst({ where: { id, teacherId: session.user.id } });
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const body = await req.json();
  const result = classSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const updated = await prisma.class.update({
    where: { id },
    data: result.data,
  });

  return NextResponse.json({ class: updated });
}

// DELETE: archive class
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const cls = await prisma.class.findFirst({ where: { id, teacherId: session.user.id } });
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  await prisma.class.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  return NextResponse.json({ success: true });
}
