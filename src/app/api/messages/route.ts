import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { messageSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const otherUserId = req.nextUrl.searchParams.get("userId");

  if (otherUserId) {
    // Thread between session user and other user
    const messages = await prisma.teacherMessage.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, role: true, avatar: true } },
        recipient: { select: { id: true, name: true, role: true, avatar: true } },
      },
      orderBy: { sentAt: "asc" },
    });

    // Mark received messages in this thread as read
    await prisma.teacherMessage.updateMany({
      where: {
        senderId: otherUserId,
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ messages });
  }

  // All messages involving user (grouped or latest)
  const messages = await prisma.teacherMessage.findMany({
    where: {
      OR: [{ senderId: userId }, { recipientId: userId }],
    },
    include: {
      sender: { select: { id: true, name: true, role: true, avatar: true } },
      recipient: { select: { id: true, name: true, role: true, avatar: true } },
    },
    orderBy: { sentAt: "desc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const result = messageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { recipientId, classId, subject, message } = result.data;

    // Check recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, name: true },
    });

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const newMessage = await prisma.teacherMessage.create({
      data: {
        senderId: session.user.id,
        recipientId,
        classId: classId || null,
        subject,
        message,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        recipient: { select: { id: true, name: true, role: true } },
      },
    });

    // Notify recipient
    await createNotification({
      userId: recipientId,
      title: `Message from ${session.user.name || "User"}`,
      message: `${subject}: ${message.slice(0, 80)}...`,
      type: "GENERAL",
      link: session.user.role === "TEACHER" ? `/dashboard/parent/messages` : `/dashboard/teacher/messages`,
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error: any) {
    console.error("Message error:", error);
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
