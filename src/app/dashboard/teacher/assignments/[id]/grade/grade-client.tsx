"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Check,
  X,
  MessageSquare,
} from "lucide-react";

interface Props {
  assignment: any;
}

export function TeacherGradeClient({ assignment }: Props) {
  const students = assignment.class.enrollments.map((e: any) => e.student);
  const [submissions, setSubmissions] = useState<any[]>(assignment.submissions);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ""
  );

  const selectedSubmission = submissions.find(
    (s) => s.studentId === selectedStudentId
  );
  const selectedStudent = students.find((s: any) => s.id === selectedStudentId);

  // Form state for grading
  const [score, setScore] = useState<number>(
    selectedSubmission?.grade?.score ?? 0
  );
  const [feedback, setFeedback] = useState<string>(
    selectedSubmission?.grade?.feedback ?? ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // When changing student, update inputs
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setSuccessMessage(null);
    const sub = submissions.find((s) => s.studentId === studentId);
    if (sub?.grade) {
      setScore(sub.grade.score);
      setFeedback(sub.grade.feedback || "");
    } else {
      setScore(0);
      setFeedback("");
    }
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          score: Number(score),
          feedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save grade");

      // Update local state
      setSubmissions(
        submissions.map((s) =>
          s.id === selectedSubmission.id
            ? { ...s, status: "GRADED", grade: data.grade }
            : s
        )
      );

      setSuccessMessage("Grade saved and notifications sent to student & parent!");
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/teacher/assignments"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all assessments
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge badge-primary text-xs font-semibold">
              {assignment.class.name}
            </span>
            <span className="badge badge-warning text-xs font-semibold">
              {assignment.type}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Max Score: {assignment.totalPoints} pts
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Grade: {assignment.title}
          </h1>
          {assignment.instructions && (
            <p className="text-xs text-slate-500 mt-1">{assignment.instructions}</p>
          )}
        </div>
      </div>

      {/* Main Grid: Student List on Left, Grading Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Student List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Enrolled Students ({students.length})
            </h3>
          </div>

          {students.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No students enrolled in this class.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {students.map((st: any) => {
                const sub = submissions.find((s) => s.studentId === st.id);
                const isSelected = selectedStudentId === st.id;

                let statusBadge = (
                  <span className="badge badge-neutral text-[10px]">Unsubmitted</span>
                );
                if (sub) {
                  if (sub.status === "GRADED") {
                    statusBadge = (
                      <span className="badge badge-success text-[10px]">
                        {sub.grade?.score} / {assignment.totalPoints} pts
                      </span>
                    );
                  } else if (sub.status === "LATE") {
                    statusBadge = (
                      <span className="badge badge-danger text-[10px]">Late</span>
                    );
                  } else {
                    statusBadge = (
                      <span className="badge badge-warning text-[10px]">Turned In</span>
                    );
                  }
                }

                return (
                  <button
                    key={st.id}
                    onClick={() => handleSelectStudent(st.id)}
                    className={`w-full text-left p-4 flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-primary-50/70 border-l-4 border-primary-600"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {st.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{st.name}</h4>
                        <p className="text-[10px] text-slate-400">{st.email}</p>
                      </div>
                    </div>
                    {statusBadge}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Submission Details & Grading Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedStudent ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              Select a student from the list to view and grade their submission.
            </div>
          ) : !selectedSubmission ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                {selectedStudent.name} has not submitted yet
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                The student has not turned in their work or completed the quiz questions.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Submission Overview Box */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedStudent.name}&apos;s Submission
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submitted on:{" "}
                      {selectedSubmission.submittedAt
                        ? new Date(selectedSubmission.submittedAt).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                  <span
                    className={`badge text-xs font-semibold ${
                      selectedSubmission.status === "GRADED"
                        ? "badge-success"
                        : selectedSubmission.status === "LATE"
                        ? "badge-danger"
                        : "badge-warning"
                    }`}
                  >
                    {selectedSubmission.status}
                  </span>
                </div>

                {/* Submitted Files if any */}
                {selectedSubmission.fileUrl && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-600" />
                      <span className="text-xs font-semibold text-slate-800">
                        {selectedSubmission.fileName || "Student Work Attachment"}
                      </span>
                    </div>
                    <a
                      href={selectedSubmission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs px-3 py-1 rounded-lg"
                    >
                      Download / View
                    </a>
                  </div>
                )}

                {/* Questions & Student Answers */}
                <div className="mt-6 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Question Responses ({assignment.questions.length})
                  </h4>

                  {assignment.questions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No structured questions attached to this task.</p>
                  ) : (
                    assignment.questions.map((q: any, qIdx: number) => {
                      const response = selectedSubmission.responses.find(
                        (r: any) => r.questionId === q.id
                      );

                      return (
                        <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">
                              Question {qIdx + 1}: {q.text}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {q.points} pts
                            </span>
                          </div>

                          {/* Multiple Choice Answers */}
                          {q.type === "MULTIPLE_CHOICE" && (
                            <div className="space-y-1.5 pl-2 mt-2">
                              {q.answerChoices.map((choice: any) => {
                                const isSelected = response?.selectedChoiceId === choice.id;
                                const isCorrect = choice.isCorrect;

                                return (
                                  <div
                                    key={choice.id}
                                    className={`text-xs p-2 rounded-lg flex items-center justify-between ${
                                      isSelected && isCorrect
                                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold"
                                        : isSelected && !isCorrect
                                        ? "bg-red-100 text-red-900 border border-red-300 font-semibold"
                                        : isCorrect
                                        ? "bg-emerald-50/60 text-emerald-800"
                                        : "bg-white text-slate-600"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {isSelected ? (
                                        isCorrect ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : (
                                          <X className="w-3.5 h-3.5 text-red-600" />
                                        )
                                      ) : (
                                        <div className="w-3.5 h-3.5" />
                                      )}
                                      <span>{choice.text}</span>
                                    </div>
                                    {isSelected && (
                                      <span className="text-[10px] uppercase font-bold tracking-wider">
                                        Student Selected
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Text / Essay Answers */}
                          {q.type !== "MULTIPLE_CHOICE" && (
                            <div className="mt-2 p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-800">
                              <span className="text-[10px] text-slate-400 block font-semibold mb-1">
                                Student Answer:
                              </span>
                              {response?.answerText || <span className="italic text-slate-400">No answer provided</span>}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Grading Form Box */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-600" />
                  Assign Score & Feedback
                </h3>

                {successMessage && (
                  <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleSaveGrade} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Score (out of {assignment.totalPoints} points) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={assignment.totalPoints}
                      required
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="input-field w-32 text-sm py-2 px-3 rounded-xl border border-slate-200 font-bold text-primary-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Teacher Comments & Constructive Feedback
                    </label>
                    <textarea
                      rows={4}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Write guidance, commendations, or areas for improvement. This will be visible to the student and their parents..."
                      className="input-field w-full text-xs py-2 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    {isSubmitting ? "Saving..." : "Save Grade & Send Notifications"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
