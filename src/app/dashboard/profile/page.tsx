import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      bio: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/auth/signin");

  return (
    <DashboardShell
      role={session.user.role as any}
      user={{
        name: user.name,
        email: user.email,
        role: session.user.role as any,
      }}
    >
      <ProfileClient user={user} />
    </DashboardShell>
  );
}
