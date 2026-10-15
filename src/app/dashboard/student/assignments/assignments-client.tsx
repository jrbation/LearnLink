"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Search,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  School,
  ExternalLink,
} from "lucide-react";

interface Props {
  initialAssignments: any[];
  classes: any[];
}

export function StudentAssignmentsClient({ initialAssignments, classes }: Props) {
  const [assignments] = useState(initialAssignments);
  const [tab, setTab] = useState<"pending" | "completed" | "all">("pending");
  const [classFilter, setClassFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = assignments.filter((asg) => {
    const sub = asg.submissions[0];
    const isSubmitted = !!sub && sub.status !== "DRAFT";

    // Tab filter
    if (tab === "pending" && isSubmitted) return false;
    if (tab === "completed" && !isSubmitted) return false;

    // Class filter
    if (classFilter !== "all" && asg.classId !== classFilter) return false;

    // Search filter
    const matchesSearch =
      asg.title.toLowerCase().includes(search.toLowerCase()) ||
      asg.class.name.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-primary-600" />
          Assessments, Quizzes & Tasks
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete quizzes with automated grading, submit written assignments, and track grades with teacher feedback.
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 border-b border-slate-200 sm:border-none">
          {[
            { id: "pending", label: "Pending Tasks" },
            { id: "completed", label: "Completed & Graded" },
            { id: "all", label: "All Tasks" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                tab === t.id
                  ? "bg-primary-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="input-field bg-white text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No tasks in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {tab === "pending"
              ? "Great job! You have completed all assigned homework and quizzes."
              : "No assignments match your filter criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((asg) => {
            const sub = asg.submissions[0];
            const isSubmitted = !!sub && sub.status !== "DRAFT";
            const isGraded = sub?.status === "GRADED";
            const isOverdue = asg.dueDate && new Date() > new Date(asg.dueDate) && !isSubmitted;

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs hover:border-slate-300 transition-all"
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
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {asg.totalPoints} Points
                    </span>

                    {isGraded ? (
                      <span className="badge badge-success text-[10px] font-bold">
                        Score: {sub.grade.score} / {asg.totalPoints} ({Math.round(sub.grade.percentage)}%)
                      </span>
                    ) : isSubmitted ? (
                      <span className="badge badge-primary text-[10px] font-bold">
                        Submitted - Pending Teacher Review
                      </span>
                    ) : isOverdue ? (
                      <span className="badge badge-danger text-[10px] font-bold">
                        Overdue
                      </span>
                    ) : (
                      <span className="badge badge-neutral text-[10px]">
                        To Do
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{asg.title}</h3>
                  {asg.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">{asg.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    {asg.dueDate ? (
                      <span className={`flex items-center gap-1 font-medium ${isOverdue ? "text-red-600" : "text-slate-600"}`}>
                        <Clock className="w-3.5 h-3.5" />
                        Due {new Date(asg.dueDate).toLocaleDateString()} at{" "}
                        {new Date(asg.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span>No deadline</span>
                    )}

                    <span>{asg._count?.questions || 0} Questions</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/dashboard/student/assignments/${asg.id}`}
                    className={`text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all ${
                      isGraded
                        ? "btn-secondary text-primary-700"
                        : isSubmitted
                        ? "btn-secondary text-slate-700"
                        : "btn-primary"
                    }`}
                  >
                    {isGraded ? (
                      <>
                        <Award className="w-4 h-4" />
                        <span>Review Score & Solutions</span>
                      </>
                    ) : isSubmitted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>View Submission</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Start Assessment</span>
                      </>
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
