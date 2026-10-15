"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Award,
  Upload,
  FileText,
  AlertTriangle,
  Paperclip,
  Check,
  X,
  Sparkles,
} from "lucide-react";

interface Props {
  assignment: any;
  existingSubmission: any;
}

export function StudentQuizRunnerClient({ assignment, existingSubmission }: Props) {
  const [submission, setSubmission] = useState(existingSubmission);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Student answer state
  const initialAnswers: { [qId: string]: { selectedChoiceId?: string; answerText?: string } } = {};
  if (existingSubmission?.responses) {
    for (const resp of existingSubmission.responses) {
      initialAnswers[resp.questionId] = {
        selectedChoiceId: resp.selectedChoiceId || undefined,
        answerText: resp.answerText || "",
      };
    }
  }

  const [answers, setAnswers] = useState(initialAnswers);
  const [fileUrl, setFileUrl] = useState<string | null>(existingSubmission?.fileUrl || null);
  const [fileName, setFileName] = useState<string | null>(existingSubmission?.fileName || null);
  const [uploading, setUploading] = useState(false);

  const isGraded = submission?.status === "GRADED";
  const isSubmitted = !!submission && submission.status !== "DRAFT";

  const handleSelectChoice = (questionId: string, choiceId: string) => {
    if (isSubmitted) return;
    setAnswers({
      ...answers,
      [questionId]: {
        ...answers[questionId],
        selectedChoiceId: choiceId,
      },
    });
  };

  const handleTextChange = (questionId: string, text: string) => {
    if (isSubmitted) return;
    setAnswers({
      ...answers,
      [questionId]: {
        ...answers[questionId],
        answerText: text,
      },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload file");

      setFileUrl(data.url);
      setFileName(data.fileName);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const responsePayload = Object.keys(answers).map((qId) => ({
        questionId: qId,
        selectedChoiceId: answers[qId]?.selectedChoiceId,
        answerText: answers[qId]?.answerText,
      }));

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          responses: responsePayload,
          fileUrl,
          fileName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit assignment");

      // Reload or set submission
      setSubmission(data.submission);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/student/assignments"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all tasks
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="badge badge-primary text-xs font-bold">
              {assignment.class.name}
            </span>
            <span className="badge badge-warning text-xs font-bold">
              {assignment.type}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
              {assignment.totalPoints} Total Points
            </span>
          </div>

          {assignment.dueDate && (
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Due: {new Date(assignment.dueDate).toLocaleString()}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {assignment.title}
        </h1>

        {assignment.instructions && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <strong className="block text-slate-900 font-semibold mb-1">Instructions:</strong>
            {assignment.instructions}
          </div>
        )}
      </div>

      {/* Graded Summary Banner */}
      {isGraded && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-6 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                {Math.round(submission.grade.percentage)}%
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Score: {submission.grade.score} / {assignment.totalPoints} Points
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Assessment graded on {new Date(submission.grade.gradedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {submission.grade.feedback && (
            <div className="mt-4 pt-4 border-t border-emerald-200/60 text-xs text-emerald-900">
              <strong className="block font-semibold mb-1">Instructor Feedback:</strong>
              <p className="italic bg-white/70 p-3 rounded-xl border border-emerald-100">
                &ldquo;{submission.grade.feedback}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {/* Submitted but awaiting review banner */}
      {isSubmitted && !isGraded && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-900">Submitted Successfully</h3>
            <p className="text-xs text-blue-700 mt-0.5">
              Your submission has been recorded. Your teacher will review and assign your grade shortly.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-semibold">
          {error}
        </div>
      )}

      {/* Questions & Assessment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {assignment.questions.length > 0 ? (
          assignment.questions.map((q: any, qIdx: number) => {
            const studentChoice = answers[q.id]?.selectedChoiceId;
            const studentText = answers[q.id]?.answerText || "";

            return (
              <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Question {qIdx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {q.points} {q.points === 1 ? "pt" : "pts"}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-800">{q.text}</p>

                {/* Multiple Choice */}
                {q.type === "MULTIPLE_CHOICE" && (
                  <div className="space-y-2 pt-1">
                    {q.answerChoices.map((choice: any) => {
                      const isSelected = studentChoice === choice.id;
                      const isCorrectChoice = isGraded && choice.isCorrect;

                      return (
                        <label
                          key={choice.id}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isGraded
                              ? isSelected && isCorrectChoice
                                ? "bg-emerald-50 border-emerald-400 font-semibold"
                                : isSelected && !isCorrectChoice
                                ? "bg-red-50 border-red-400 font-semibold"
                                : isCorrectChoice
                                ? "bg-emerald-50/50 border-emerald-300"
                                : "bg-white border-slate-200"
                              : isSelected
                              ? "bg-primary-50 border-primary-500 shadow-2xs font-semibold"
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          } ${isSubmitted ? "cursor-default" : ""}`}
                        >
                          <input
                            type="radio"
                            disabled={isSubmitted}
                            name={`question-${q.id}`}
                            checked={isSelected}
                            onChange={() => handleSelectChoice(q.id, choice.id)}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-xs text-slate-800 flex-1">{choice.text}</span>

                          {isGraded && (
                            <span>
                              {isSelected && isCorrectChoice && (
                                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                  <Check className="w-4 h-4" /> Correct
                                </span>
                              )}
                              {isSelected && !isCorrectChoice && (
                                <span className="text-red-600 font-bold text-xs flex items-center gap-1">
                                  <X className="w-4 h-4" /> Incorrect
                                </span>
                              )}
                              {!isSelected && isCorrectChoice && (
                                <span className="text-emerald-600 font-semibold text-xs">
                                  Correct Answer
                                </span>
                              )}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Open Ended / Short Answer */}
                {q.type !== "MULTIPLE_CHOICE" && (
                  <div className="pt-1">
                    <textarea
                      rows={3}
                      disabled={isSubmitted}
                      value={studentText}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                      placeholder="Type your detailed response here..."
                      className="input-field w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-xs text-slate-600">
            This task does not contain multiple-choice questions. Please review instructions and submit your homework document below.
          </div>
        )}

        {/* File Attachment / Homework Upload Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Paperclip className="w-4 h-4 text-primary-600" />
            Homework Document Attachment
          </h3>
          <p className="text-xs text-slate-500">
            Upload your homework file, scanned worksheets, essay documents, or code files.
          </p>

          {fileUrl ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-semibold text-slate-800">{fileName || "Attached Document"}</span>
              </div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 font-semibold hover:underline"
              >
                View File
              </a>
            </div>
          ) : !isSubmitted ? (
            <div>
              <label className="btn-secondary text-xs px-4 py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-2 font-semibold border border-slate-200 shadow-2xs">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? "Uploading..." : "Choose File to Upload"}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No file attached.</span>
          )}
        </div>

        {/* Action Button */}
        {!isSubmitted && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="btn-primary text-xs font-semibold px-6 py-3 rounded-xl shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting Work..." : "Submit Assessment"}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
