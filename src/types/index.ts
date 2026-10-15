// LearnLink Core Domain Types

export type UserRole = "TEACHER" | "STUDENT" | "PARENT";

export const UserRole = {
  TEACHER: "TEACHER" as const,
  STUDENT: "STUDENT" as const,
  PARENT: "PARENT" as const,
};

export type NotificationType =
  | "ANNOUNCEMENT"
  | "GRADE_RELEASED"
  | "ASSIGNMENT_DUE"
  | "ASSIGNMENT_OVERDUE"
  | "SCHEDULE_CHANGE"
  | "ENROLLMENT"
  | "SUBMISSION"
  | "FEEDBACK"
  | "GENERAL";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export type AssignmentType = "ASSIGNMENT" | "QUIZ";

export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "LATE" | "GRADED" | "RETURNED";

export type QuestionType = "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "ESSAY";

export type LinkStatus = "PENDING" | "ACTIVE" | "REVOKED";

export type LessonStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ScheduleStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
