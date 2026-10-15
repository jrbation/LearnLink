"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Users,
  Trash2,
  Calendar,
  Sparkles,
} from "lucide-react";

interface Props {
  initialAssignments: any[];
  classes: any[];
  selectedClassId?: string;
}

interface QuestionFormItem {
  text: string;
  type: "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "ESSAY";
  points: number;
  answerChoices: { text: string; isCorrect: boolean }[];
}

export function TeacherAssignmentsClient({ initialAssignments, classes, selectedClassId }: Props) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [classFilter, setClassFilter] = useState(selectedClassId || "all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    classId: classes[0]?.id || "",
    title: "",
    description: "",
    instructions: "",
    type: "ASSIGNMENT",
    totalPoints: 100,
    dueDate: "",
    timeLimitMinutes: "",
    allowLate: false,
    status: "PUBLISHED",
  });

  const [questions, setQuestions] = useState<QuestionFormItem[]>([
    {
      text: "",
      type: "MULTIPLE_CHOICE",
      points: 10,
      answerChoices: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
    },
  ]);

  const filteredAssignments = assignments.filter((a) => {
    const matchesClass = classFilter === "all" || a.classId === classFilter;
    const matchesType = typeFilter === "all" || a.type === typeFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.class.name.toLowerCase().includes(search.toLowerCase());
    return matchesClass && matchesType && matchesSearch;
  });

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "MULTIPLE_CHOICE",
        points: 10,
        answerChoices: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleAddChoice = (qIdx: number) => {
    const updated = [...questions];
    updated[qIdx].answerChoices.push({ text: "", isCorrect: false });
    setQuestions(updated);
  };

  const handleRemoveChoice = (qIdx: number, cIdx: number) => {
    const updated = [...questions];
    updated[qIdx].answerChoices = updated[qIdx].answerChoices.filter((_, i) => i !== cIdx);
    setQuestions(updated);
  };

  const handleChoiceCorrect = (qIdx: number, cIdx: number) => {
    const updated = [...questions];
    updated[qIdx].answerChoices = updated[qIdx].answerChoices.map((c, i) => ({
      ...c,
      isCorrect: i === cIdx,
    }));
    setQuestions(updated);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate questions if quiz
      const validQuestions = questions.filter((q) => q.text.trim().length > 0);

      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          timeLimitMinutes: formData.timeLimitMinutes ? Number(formData.timeLimitMinutes) : null,
          questions: validQuestions.length > 0 ? validQuestions : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create assessment");

      const createdWithClass = {
        ...data.assignment,
        class: classes.find((c) => c.id === formData.classId) || { name: "Class" },
        _count: { submissions: 0, questions: validQuestions.length },
        submissions: [],
      };

      setAssignments([createdWithClass, ...assignments]);
      setShowModal(false);
      setFormData({
        classId: classes[0]?.id || "",
        title: "",
        description: "",
        instructions: "",
        type: "ASSIGNMENT",
        totalPoints: 100,
        dueDate: "",
        timeLimitMinutes: "",
        allowLate: false,
        status: "PUBLISHED",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAssignments(assignments.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary-600" />
            Assessments, Quizzes & Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build interactive quizzes with instant auto-grading, create homework assignments, and grade submissions.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title..."
            className="w-full bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="input-field w-full h-full bg-white text-xs font-semibold py-3 px-3 rounded-xl border border-slate-200"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field w-full h-full bg-white text-xs font-semibold py-3 px-3 rounded-xl border border-slate-200"
          >
            <option value="all">All Types</option>
            <option value="ASSIGNMENT">Assignments</option>
            <option value="QUIZ">Quizzes</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No assessments found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {search || classFilter !== "all" || typeFilter !== "all"
              ? "No tasks match your filter criteria."
              : "Create your first quiz or assignment to evaluate student comprehension."}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs px-4 py-2 rounded-xl"
          >
            Create Assessment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((asg) => {
            const gradedCount = asg.submissions.filter((s: any) => s.status === "GRADED").length;
            const pendingCount = asg.submissions.filter(
              (s: any) => s.status === "SUBMITTED" || s.status === "LATE"
            ).length;

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-primary text-[10px] font-bold">
                      {asg.class.name}
                    </span>
                    <span
                      className={`badge text-[10px] font-bold ${
                        asg.type === "QUIZ" ? "badge-warning" : "badge-secondary"
                      }`}
                    >
                      {asg.type}
                    </span>
                    <span
                      className={`badge text-[10px] ${
                        asg.status === "PUBLISHED" ? "badge-success" : "badge-neutral"
                      }`}
                    >
                      {asg.status}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {asg.totalPoints} Points
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{asg.title}</h3>
                  {asg.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{asg.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    {asg.dueDate ? (
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Due {new Date(asg.dueDate).toLocaleDateString()} at{" "}
                        {new Date(asg.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    ) : (
                      <span>No due date</span>
                    )}

                    {asg.timeLimitMinutes && (
                      <span>Time limit: {asg.timeLimitMinutes} mins</span>
                    )}

                    <span>{asg._count?.questions || 0} Questions</span>
                  </div>
                </div>

                {/* Submissions & Actions */}
                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0 justify-between md:justify-end">
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-base font-bold text-slate-900">
                        {asg._count?.submissions || 0}
                      </span>
                      <span className="text-xs text-slate-400">Turned in</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {pendingCount > 0 ? (
                        <span className="text-amber-600 font-bold">{pendingCount} Pending Review</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">{gradedCount} Graded</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/teacher/assignments/${asg.id}/grade`}
                      className="btn-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Grade Submissions
                    </Link>
                    <button
                      onClick={() => handleDeleteAssignment(asg.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assessment Builder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                Assessment & Quiz Builder
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateAssignment} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Class *
                  </label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="input-field w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assessment Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                  >
                    <option value="ASSIGNMENT">Assignment (Standard / Homework)</option>
                    <option value="QUIZ">Quiz (Interactive / Auto-Gradable)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Midterm Quiz on Photosynthesis"
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions & Guidelines
                </label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Submission rules, allowed calculators, reference formulas..."
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Points
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalPoints}
                    onChange={(e) => setFormData({ ...formData, totalPoints: Number(e.target.value) })}
                    className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input-field w-full text-xs py-2 px-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Time Limit (Mins)
                  </label>
                  <input
                    type="number"
                    min={5}
                    placeholder="Optional"
                    value={formData.timeLimitMinutes}
                    onChange={(e) => setFormData({ ...formData, timeLimitMinutes: e.target.value })}
                    className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowLate"
                  checked={formData.allowLate}
                  onChange={(e) => setFormData({ ...formData, allowLate: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="allowLate" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Allow late submissions with penalty tag
                </label>
              </div>

              {/* Questions Section (Auto-graded for Quizzes) */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Questions ({questions.length})
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Add multiple-choice questions for instant auto-grading.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="btn-secondary text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-700">Question {qIdx + 1}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={q.points}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIdx].points = Number(e.target.value);
                              setQuestions(updated);
                            }}
                            className="w-16 text-xs py-1 px-2 border rounded-md"
                            title="Points"
                          />
                          <span className="text-[11px] text-slate-400">pts</span>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Enter question prompt..."
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIdx].text = e.target.value;
                          setQuestions(updated);
                        }}
                        className="input-field w-full text-xs py-2 px-3 bg-white rounded-lg border border-slate-200"
                      />

                      {/* Options */}
                      <div className="space-y-1.5 pl-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Choices (Check the correct answer for auto-grading):
                        </span>
                        {q.answerChoices.map((c, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={c.isCorrect}
                              onChange={() => handleChoiceCorrect(qIdx, cIdx)}
                              className="text-emerald-600 focus:ring-emerald-500"
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              placeholder={`Choice ${cIdx + 1}`}
                              value={c.text}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[qIdx].answerChoices[cIdx].text = e.target.value;
                                setQuestions(updated);
                              }}
                              className="input-field flex-1 text-xs py-1 px-2.5 bg-white rounded-md border border-slate-200"
                            />
                            {q.answerChoices.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveChoice(qIdx, cIdx)}
                                className="text-slate-400 hover:text-red-500 text-xs px-1"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddChoice(qIdx)}
                          className="text-[11px] text-primary-600 font-semibold hover:underline mt-1 block"
                        >
                          + Add Choice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary px-4 py-2 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-5 py-2 text-xs font-medium rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Publishing..." : "Publish Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
