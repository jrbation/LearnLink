import { prisma } from "@/lib/db";
import type { NotificationType } from "@/types";

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

/**
 * Create a notification for a single user.
 */
export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
    },
  });
}

/**
 * Create notifications for multiple users.
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
) {
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
    })),
  });
}

/**
 * Notify all enrolled students in a class.
 */
export async function notifyClassStudents(
  classId: string,
  params: Omit<CreateNotificationParams, "userId">
) {
  const enrollments = await prisma.enrollment.findMany({
    where: { classId, status: "ACTIVE" },
    select: { studentId: true },
  });

  const studentIds = enrollments.map((e) => e.studentId);
  if (studentIds.length > 0) {
    await createBulkNotifications(studentIds, params);
  }
  return studentIds;
}

/**
 * Notify parents of students enrolled in a class.
 */
export async function notifyClassParents(
  classId: string,
  params: Omit<CreateNotificationParams, "userId">
) {
  const enrollments = await prisma.enrollment.findMany({
    where: { classId, status: "ACTIVE" },
    select: { studentId: true },
  });

  const studentIds = enrollments.map((e) => e.studentId);

  const parentLinks = await prisma.parentChild.findMany({
    where: {
      childId: { in: studentIds },
      status: "ACTIVE",
    },
    select: { parentId: true },
  });

  const parentIds = [...new Set(parentLinks.map((p) => p.parentId))];
  if (parentIds.length > 0) {
    await createBulkNotifications(parentIds, params);
  }
  return parentIds;
}

/**
 * Notify parents of a specific student.
 */
export async function notifyParentsOfStudent(
  studentId: string,
  params: Omit<CreateNotificationParams, "userId">
) {
  const parentLinks = await prisma.parentChild.findMany({
    where: {
      childId: studentId,
      status: "ACTIVE",
    },
    select: { parentId: true },
  });

  const parentIds = [...new Set(parentLinks.map((p) => p.parentId))];
  if (parentIds.length > 0) {
    await createBulkNotifications(parentIds, params);
  }
  return parentIds;
}

/**
 * Notify both students and parents for a class event.
 */
export async function notifyClassMembers(
  classId: string,
  params: Omit<CreateNotificationParams, "userId">
) {
  const studentIds = await notifyClassStudents(classId, params);
  const parentIds = await notifyClassParents(classId, params);
  return { studentIds, parentIds };
}

/**
 * Get unread notification count for a user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
