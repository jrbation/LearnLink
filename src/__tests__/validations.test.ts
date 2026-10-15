import { describe, it, expect } from "vitest";
import {
  signUpSchema,
  signInSchema,
  classSchema,
  enrollmentCodeSchema,
  assignmentSchema,
  attendanceSchema,
  announcementSchema,
  parentChildLinkSchema,
} from "../lib/validations";

describe("Validation Schemas", () => {
  describe("signUpSchema", () => {
    it("validates valid teacher sign-up", () => {
      const valid = {
        name: "Jane Doe",
        email: "jane@school.edu",
        password: "Password123",
        confirmPassword: "Password123",
        role: "TEACHER",
      };
      const result = signUpSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails when passwords do not match", () => {
      const invalid = {
        name: "Jane Doe",
        email: "jane@school.edu",
        password: "Password123",
        confirmPassword: "Password456",
        role: "STUDENT",
      };
      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("fails with weak password (missing number/uppercase)", () => {
      const invalid = {
        name: "Jane Doe",
        email: "jane@school.edu",
        password: "password",
        confirmPassword: "password",
        role: "STUDENT",
      };
      const result = signUpSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("classSchema", () => {
    it("validates valid class inputs", () => {
      const valid = {
        name: "AP Biology",
        subject: "Science",
        gradeLevel: "11",
        section: "A",
        description: "Advanced biology with lab work",
      };
      const result = classSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const invalid = {
        name: "",
        subject: "Science",
      };
      const result = classSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("assignmentSchema", () => {
    it("validates quiz and homework assignments", () => {
      const quiz = {
        classId: "class-123",
        title: "Photosynthesis Quiz",
        type: "QUIZ",
        totalPoints: 50,
      };
      const result = assignmentSchema.safeParse(quiz);
      expect(result.success).toBe(true);
    });
  });

  describe("attendanceSchema", () => {
    it("validates correct attendance status options", () => {
      const records = {
        scheduleId: "sch-1",
        records: [
          { studentId: "std-1", status: "PRESENT" },
          { studentId: "std-2", status: "ABSENT", notes: "Excused illness" },
          { studentId: "std-3", status: "LATE" },
        ],
      };
      const result = attendanceSchema.safeParse(records);
      expect(result.success).toBe(true);
    });
  });

  describe("parentChildLinkSchema", () => {
    it("validates student email for account pairing", () => {
      const valid = { childEmail: "student@school.edu" };
      expect(parentChildLinkSchema.safeParse(valid).success).toBe(true);

      const invalid = { childEmail: "not-an-email" };
      expect(parentChildLinkSchema.safeParse(invalid).success).toBe(false);
    });
  });
});
