import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { announcementSchema } from "@/lib/validations";
import { notifyClassStudents, notifyClassParents } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = req.nextUrl.searchParams.get("classId");
  const childId = req.nextUrl.searchParams.get("childId");

  if (session.user.role === "TEACHER") {
    const where: any = { teacherId: session.user.id };
    if (classId) where.classId = classId;

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, subject: true } },
        teacher: { select: { name: true, avatar: true } },
      },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    });

    return NextResponse.json({ announcements });
  }

  if (session.user.role === "STUDENT") {
    // Announcements for all or student-targeted, where student is enrolled
    const announcements = await prisma.announcement.findMany({
      where: {
        targetAudience: { in: ["all", "students"] },
        class: {
          enrollments: { some: { studentId: session.user.id, status: "ACTIVE" } },
        },
        ...(classId ? { classId } : {}),
      },
      include: {
        class: { select: { id: true, name: true, subject: true } },
        teacher: { select: { name: true, avatar: true } },
      },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    });

    return NextResponse.json({ announcements });
  }

  if (session.user.role === "PARENT") {
    // Parent sees announcements targeted to 'all' or 'parents' for classes their child is enrolled in
    const targetChildId = childId;
    const parentLinks = await prisma.parentChild.findMany({
      where: {
        parentId: session.user.id,
        status: "ACTIVE",
        ...(targetChildId ? { childId: targetChildId } : {}),
      },
      select: { childId: true },
    });
    const childIds = parentLinks.map((p) => p.childId);

    const announcements = await prisma.announcement.findMany({
      where: {
        targetAudience: { in: ["all", "parents"] },
        class: {
          enrollments: { some: { studentId: { in: childIds }, status: "ACTIVE" } },
        },
      },
      include: {
        class: { select: { id: true, name: true, subject: true } },
        teacher: { select: { name: true, avatar: true } },
      },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    });

    return NextResponse.json({ announcements });
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
    const result = announcementSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { classId, title, message, targetAudience, isPinned } = result.data;

    let className = "School Announcement";
    if (classId) {
      const cls = await prisma.class.findFirst({
        where: { id: classId, teacherId: session.user.id },
      });
      if (!cls) return NextResponse.json({ error: "Class not found or access denied" }, { status: 404 });
      className = cls.name;
    }

    const announcement = await prisma.announcement.create({
      data: {
        classId: classId || null,
        teacherId: session.user.id,
        title,
        message,
        targetAudience: targetAudience || "all",
        isPinned: Boolean(isPinned),
      },
      include: {
        class: { select: { name: true } },
        teacher: { select: { name: true } },
      },
    });

    // Notify target audience
    if (classId) {
      if (targetAudience === "all" || targetAudience === "students") {
        await notifyClassStudents(classId, {
          title: `Announcement: ${title}`,
          message: `${className}: ${message.slice(0, 100)}...`,
          type: "ANNOUNCEMENT",
          link: `/dashboard/student/announcements`,
        });
      }

      if (targetAudience === "all" || targetAudience === "parents") {
        await notifyClassParents(classId, {
          title: `Announcement for ${className}`,
          message: `${title}: ${message.slice(0, 100)}...`,
          type: "ANNOUNCEMENT",
          link: `/dashboard/parent/announcements`,
        });
      }
    }

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error: any) {
    console.error("Announcement error:", error);
    return NextResponse.json({ error: error.message || "Failed to create announcement" }, { status: 500 });
  }
}
