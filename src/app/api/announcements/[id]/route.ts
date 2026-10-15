import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!existing) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  if (existing.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
