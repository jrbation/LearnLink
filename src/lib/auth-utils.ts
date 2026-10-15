import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { UserRole } from "@/types";

/**
 * Get the current authenticated session, or redirect to sign-in.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }
  return session;
}

/**
 * Require a specific role; redirect if unauthorized.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    redirect("/unauthorized");
  }
  return session;
}

/**
 * Get the role-specific dashboard path for the current user.
 */
export function getDashboardPath(role: string): string {
  switch (role) {
    case "TEACHER":
      return "/dashboard/teacher";
    case "STUDENT":
      return "/dashboard/student";
    case "PARENT":
      return "/dashboard/parent";
    default:
      return "/auth/signin";
  }
}

/**
 * Check if a teacher owns a class.
 */
export async function requireClassOwner(classId: string, teacherId: string) {
  const classData = await prisma.class.findFirst({
    where: { id: classId, teacherId },
  });
  if (!classData) {
    redirect("/unauthorized");
  }
  return classData;
}

/**
 * Check if a student is enrolled in a class.
 */
export async function requireEnrolledStudent(classId: string, studentId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      classId,
      studentId,
      status: "ACTIVE",
    },
  });
  if (!enrollment) {
    redirect("/unauthorized");
  }
  return enrollment;
}

/**
 * Check if a parent is linked to a child.
 */
export async function requireParentChild(parentId: string, childId: string) {
  const link = await prisma.parentChild.findFirst({
    where: {
      parentId,
      childId,
      status: "ACTIVE",
    },
  });
  if (!link) {
    redirect("/unauthorized");
  }
  return link;
}

/**
 * Get the linked children for a parent.
 */
export async function getLinkedChildren(parentId: string) {
  const links = await prisma.parentChild.findMany({
    where: {
      parentId,
      status: "ACTIVE",
    },
    include: {
      child: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
  return links.map((l) => l.child);
}
