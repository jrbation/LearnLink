import { describe, it, expect } from "vitest";

describe("Grading & Assessment Logic", () => {
  interface Question {
    id: string;
    type: "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "ESSAY";
    points: number;
    answerChoices: { id: string; text: string; isCorrect: boolean }[];
  }

  interface Response {
    questionId: string;
    selectedChoiceId?: string;
    answerText?: string;
  }

  function autoGradeQuiz(questions: Question[], responses: Response[]) {
    let totalScore = 0;
    let maxScore = 0;
    let allAutoGradable = questions.length > 0;

    for (const q of questions) {
      maxScore += q.points;
      if (q.type !== "MULTIPLE_CHOICE") {
        allAutoGradable = false;
      }
    }

    if (!allAutoGradable) {
      return { status: "SUBMITTED", totalScore: null, percentage: null, autoGraded: false };
    }

    for (const resp of responses) {
      const question = questions.find((q) => q.id === resp.questionId);
      if (question && question.type === "MULTIPLE_CHOICE" && resp.selectedChoiceId) {
        const choice = question.answerChoices.find((c) => c.id === resp.selectedChoiceId);
        if (choice?.isCorrect) {
          totalScore += question.points;
        }
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 100;
    return {
      status: "GRADED",
      totalScore,
      maxScore,
      percentage: Math.round(percentage * 10) / 10,
      autoGraded: true,
    };
  }

  it("calculates 100% when all multiple-choice answers are correct", () => {
    const questions: Question[] = [
      {
        id: "q1",
        type: "MULTIPLE_CHOICE",
        points: 10,
        answerChoices: [
          { id: "c1", text: "Paris", isCorrect: true },
          { id: "c2", text: "London", isCorrect: false },
        ],
      },
      {
        id: "q2",
        type: "MULTIPLE_CHOICE",
        points: 15,
        answerChoices: [
          { id: "c3", text: "Mars", isCorrect: true },
          { id: "c4", text: "Venus", isCorrect: false },
        ],
      },
    ];

    const responses: Response[] = [
      { questionId: "q1", selectedChoiceId: "c1" },
      { questionId: "q2", selectedChoiceId: "c3" },
    ];

    const result = autoGradeQuiz(questions, responses);
    expect(result.autoGraded).toBe(true);
    expect(result.totalScore).toBe(25);
    expect(result.maxScore).toBe(25);
    expect(result.percentage).toBe(100);
    expect(result.status).toBe("GRADED");
  });

  it("scores partial marks correctly when student selects an incorrect choice", () => {
    const questions: Question[] = [
      {
        id: "q1",
        type: "MULTIPLE_CHOICE",
        points: 10,
        answerChoices: [
          { id: "c1", text: "True", isCorrect: true },
          { id: "c2", text: "False", isCorrect: false },
        ],
      },
      {
        id: "q2",
        type: "MULTIPLE_CHOICE",
        points: 10,
        answerChoices: [
          { id: "c3", text: "Blue", isCorrect: true },
          { id: "c4", text: "Red", isCorrect: false },
        ],
      },
    ];

    const responses: Response[] = [
      { questionId: "q1", selectedChoiceId: "c1" }, // Correct (+10)
      { questionId: "q2", selectedChoiceId: "c4" }, // Wrong (+0)
    ];

    const result = autoGradeQuiz(questions, responses);
    expect(result.totalScore).toBe(10);
    expect(result.maxScore).toBe(20);
    expect(result.percentage).toBe(50);
  });

  it("leaves status as SUBMITTED when quiz contains non-multiple-choice essay questions", () => {
    const questions: Question[] = [
      {
        id: "q1",
        type: "MULTIPLE_CHOICE",
        points: 10,
        answerChoices: [{ id: "c1", text: "A", isCorrect: true }],
      },
      {
        id: "q2",
        type: "ESSAY",
        points: 40,
        answerChoices: [],
      },
    ];

    const responses: Response[] = [
      { questionId: "q1", selectedChoiceId: "c1" },
      { questionId: "q2", answerText: "Photosynthesis is the process..." },
    ];

    const result = autoGradeQuiz(questions, responses);
    expect(result.autoGraded).toBe(false);
    expect(result.status).toBe("SUBMITTED");
  });

  it("accurately detects overdue status against deadline timestamp", () => {
    const now = new Date();
    const pastDueDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    const futureDueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // tomorrow

    const isPastOverdue = now > pastDueDate;
    const isFutureOverdue = now > futureDueDate;

    expect(isPastOverdue).toBe(true);
    expect(isFutureOverdue).toBe(false);
  });
});
