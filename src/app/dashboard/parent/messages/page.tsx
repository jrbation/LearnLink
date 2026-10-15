import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ParentMessagesClient } from "./messages-client";

export default async function ParentMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "PARENT") redirect("/unauthorized");

  // Get teachers instructing linked children
  const parentLinks = await prisma.parentChild.findMany({
    where: { parentId: session.user.id, status: "ACTIVE" },
    include: {
      child: {
        include: {
          enrollments: {
            where: { status: "ACTIVE" },
            include: {
              class: {
                include: {
                  teacher: { select: { id: true, name: true, email: true, avatar: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  const teacherMap = new Map<string, any>();
  for (const link of parentLinks) {
    for (const enr of link.child.enrollments) {
      const t = enr.class.teacher;
      if (!teacherMap.has(t.id)) {
        teacherMap.set(t.id, {
          ...t,
          className: enr.class.name,
          childName: link.child.name,
        });
      }
    }
  }

  const teachers = Array.from(teacherMap.values());

  const messages = await prisma.teacherMessage.findMany({
    where: {
      OR: [{ senderId: session.user.id }, { recipientId: session.user.id }],
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      recipient: { select: { id: true, name: true, role: true } },
    },
    orderBy: { sentAt: "asc" },
  });

  return (
    <DashboardShell
      role="PARENT"
      user={{
        name: session.user.name || "Parent",
        email: session.user.email || "",
        role: "PARENT",
      }}
    >
      <ParentMessagesClient
        teachers={teachers}
        initialMessages={messages}
        currentUserId={session.user.id}
      />
    </DashboardShell>
  );
}
