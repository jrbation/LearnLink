import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ParentChildrenClient } from "./children-client";

export default async function ParentChildrenPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "PARENT") redirect("/unauthorized");

  const parentLinks = await prisma.parentChild.findMany({
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
    orderBy: { linkedAt: "desc" },
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
      <ParentChildrenClient initialLinks={parentLinks} />
    </DashboardShell>
  );
}
