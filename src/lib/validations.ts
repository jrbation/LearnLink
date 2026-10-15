import { z } from "zod";

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  role: z.enum(["TEACHER", "STUDENT", "PARENT"], {
    message: "Please select a role",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

// ============================================================
// CLASS SCHEMAS
// ============================================================

export const classSchema = z.object({
  name: z
    .string()
    .min(2, "Class name must be at least 2 characters")
    .max(100, "Class name must be less than 100 characters"),
  subject: z
    .string()
    .min(2, "Subject must be at least 2 characters")
    .max(100, "Subject must be less than 100 characters"),
  gradeLevel: z.string().optional(),
  section: z.string().optional(),
  description: z.string().max(500).optional(),
});

export const enrollmentCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Enrollment code is required")
    .max(20, "Invalid enrollment code"),
});

// ============================================================
// LESSON SCHEMAS
// ============================================================

export const lessonSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

// ============================================================
// ASSIGNMENT / QUIZ SCHEMAS
// ============================================================

export const assignmentSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
  instructions: z.string().optional(),
  type: z.enum(["ASSIGNMENT", "QUIZ"]),
  totalPoints: z.coerce.number().min(1, "Points must be at least 1").default(100),
  dueDate: z.string().optional(),
  publishDate: z.string().optional(),
  timeLimitMinutes: z.coerce.number().optional(),
  allowLate: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["MULTIPLE_CHOICE", "SHORT_ANSWER", "ESSAY"]),
  points: z.coerce.number().min(1, "Points must be at least 1").default(1),
  answerChoices: z.array(z.object({
    text: z.string().min(1, "Choice text is required"),
    isCorrect: z.boolean().default(false),
  })).optional(),
});

export const submissionSchema = z.object({
  assignmentId: z.string().min(1),
  responses: z.array(z.object({
    questionId: z.string().min(1),
    answerText: z.string().optional(),
    selectedChoiceId: z.string().optional(),
  })),
});

export const gradeSchema = z.object({
  submissionId: z.string().min(1),
  score: z.coerce.number().min(0, "Score cannot be negative"),
  feedback: z.string().optional(),
});

// ============================================================
// SCHEDULE SCHEMAS
// ============================================================

export const scheduleSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  meetingLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

// ============================================================
// ATTENDANCE SCHEMAS
// ============================================================

export const attendanceSchema = z.object({
  scheduleId: z.string().min(1),
  records: z.array(z.object({
    studentId: z.string().min(1),
    status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
    notes: z.string().optional(),
  })),
});

// ============================================================
// ANNOUNCEMENT SCHEMAS
// ============================================================

export const announcementSchema = z.object({
  classId: z.string().optional(),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters"),
  targetAudience: z.enum(["all", "students", "parents"]).default("all"),
  isPinned: z.boolean().default(false),
});

// ============================================================
// PARENT-CHILD LINK SCHEMAS
// ============================================================

export const parentChildLinkSchema = z.object({
  childEmail: z.string().email("Please enter a valid email address"),
});

// ============================================================
// MESSAGE SCHEMAS
// ============================================================

export const messageSchema = z.object({
  recipientId: z.string().min(1, "Recipient is required"),
  classId: z.string().optional(),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  message: z.string().min(1, "Message is required"),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type EnrollmentCodeInput = z.infer<typeof enrollmentCodeSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type GradeInput = z.infer<typeof gradeSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
