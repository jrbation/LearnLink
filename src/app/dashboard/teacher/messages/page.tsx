import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TeacherMessagesClient } from "./messages-client";

export default async function TeacherMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "TEACHER") redirect("/unauthorized");

  // Get enrolled students & their parents for the teacher's classes
  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          student: {
            include: {
              childParents: {
                include: {
                  parent: { select: { id: true, name: true, email: true, role: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  const parentMap = new Map<string, any>();
  for (const c of classes) {
    for (const enr of c.enrollments) {
      for (const cp of enr.student.childParents) {
        if (!parentMap.has(cp.parent.id)) {
          parentMap.set(cp.parent.id, {
            ...cp.parent,
            childName: enr.student.name,
            className: c.name,
          });
        }
      }
    }
  }

  const parents = Array.from(parentMap.values());

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
      role="TEACHER"
      user={{
        name: session.user.name || "Teacher",
        email: session.user.email || "",
        role: "TEACHER",
      }}
    >
      <TeacherMessagesClient
        parents={parents}
        initialMessages={messages}
        currentUserId={session.user.id}
      />
    </DashboardShell>
  );
}
