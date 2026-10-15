import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parentChildLinkSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const links = await prisma.parentChild.findMany({
    where: { parentId: session.user.id },
    include: {
      child: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          enrollments: {
            where: { status: "ACTIVE" },
            include: {
              class: { select: { id: true, name: true, subject: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ children: links.map((l) => ({ ...l.child, linkStatus: l.status })) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = parentChildLinkSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { childEmail } = result.data;

    // Find student
    const student = await prisma.user.findFirst({
      where: { email: childEmail.toLowerCase().trim(), role: "STUDENT" },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found with this email address." }, { status: 404 });
    }

    // Check if link already exists
    const existing = await prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId: session.user.id,
          childId: student.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "This student is already linked to your account." }, { status: 400 });
    }

    const link = await prisma.parentChild.create({
      data: {
        parentId: session.user.id,
        childId: student.id,
        status: "ACTIVE",
      },
      include: {
        child: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify child
    await createNotification({
      userId: student.id,
      title: "Parent Connected",
      message: `${session.user.name || "A parent"} has connected to your LearnLink account.`,
      type: "GENERAL",
    });

    // Notify parent
    await createNotification({
      userId: session.user.id,
      title: "Child Successfully Linked",
      message: `You are now monitoring ${student.name}'s academic progress.`,
      type: "GENERAL",
      link: "/dashboard/parent",
    });

    return NextResponse.json({ success: true, link }, { status: 201 });
  } catch (error: any) {
    console.error("Link child error:", error);
    return NextResponse.json({ error: error.message || "Failed to link student" }, { status: 500 });
  }
}
