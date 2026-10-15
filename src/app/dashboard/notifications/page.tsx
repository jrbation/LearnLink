import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NotificationsClient } from "./notifications-client";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <DashboardShell
      role={session.user.role as any}
      user={{
        name: session.user.name || "User",
        email: session.user.email || "",
        role: session.user.role as any,
      }}
    >
      <NotificationsClient initialNotifications={notifications} />
    </DashboardShell>
  );
}
