import { describe, it, expect } from "vitest";
import {
  generateEnrollmentCode,
  generateLinkCode,
  getInitials,
  calculatePercentage,
  getGradeColor,
  getGradeBadgeColor,
  getAttendanceColor,
  truncateText,
} from "../lib/utils";

describe("Utility Functions", () => {
  it("generateEnrollmentCode generates 8-character uppercase alphanumeric strings", () => {
    const code = generateEnrollmentCode();
    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[A-Z0-9]+$/);
    // Excludes ambiguous characters (0, O, 1, I)
    expect(code).not.toContain("0");
    expect(code).not.toContain("O");
    expect(code).not.toContain("1");
    expect(code).not.toContain("I");
  });

  it("generateLinkCode generates codes prefixed with PL-", () => {
    const code = generateLinkCode();
    expect(code.startsWith("PL-")).toBe(true);
    expect(code).toHaveLength(9);
  });

  it("getInitials extracts two capital letters from a name", () => {
    expect(getInitials("Sarah Johnson")).toBe("SJ");
    expect(getInitials("Alex Rivera")).toBe("AR");
    expect(getInitials("Robert")).toBe("R");
  });

  it("calculatePercentage accurately handles zero and normal quotients", () => {
    expect(calculatePercentage(0, 100)).toBe(0);
    expect(calculatePercentage(85, 100)).toBe(85);
    expect(calculatePercentage(18, 20)).toBe(90);
    expect(calculatePercentage(5, 0)).toBe(0);
  });

  it("getGradeColor returns appropriate color classes", () => {
    expect(getGradeColor(95)).toBe("text-emerald-600");
    expect(getGradeColor(85)).toBe("text-blue-600");
    expect(getGradeColor(75)).toBe("text-yellow-600");
    expect(getGradeColor(65)).toBe("text-orange-600");
    expect(getGradeColor(50)).toBe("text-red-600");
  });

  it("getAttendanceColor handles attendance status mapping", () => {
    expect(getAttendanceColor("PRESENT")).toContain("emerald");
    expect(getAttendanceColor("ABSENT")).toContain("red");
    expect(getAttendanceColor("LATE")).toContain("yellow");
    expect(getAttendanceColor("EXCUSED")).toContain("blue");
  });

  it("truncateText truncates cleanly with ellipsis", () => {
    expect(truncateText("Hello World", 20)).toBe("Hello World");
    expect(truncateText("The quick brown fox jumps over the lazy dog", 10)).toBe("The quick ...");
  });
});
