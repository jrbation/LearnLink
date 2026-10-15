"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  School,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

interface Props {
  submissions: any[];
  classes: any[];
}

export function StudentGradesClient({ submissions, classes }: Props) {
  const [classFilter, setClassFilter] = useState("all");

  const filtered = submissions.filter(
    (s) => classFilter === "all" || s.assignment.classId === classFilter
  );

  const totalGraded = filtered.length;
  const avgPercentage =
    totalGraded > 0
      ? Math.round(
          filtered.reduce((sum, s) => sum + (s.grade?.percentage || 0), 0) /
            totalGraded
        )
      : null;

  const getLetterGrade = (pct: number) => {
    if (pct >= 93) return "A";
    if (pct >= 90) return "A-";
    if (pct >= 87) return "B+";
    if (pct >= 83) return "B";
    if (pct >= 80) return "B-";
    if (pct >= 75) return "C+";
    if (pct >= 70) return "C";
    return "Needs Work";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-primary-600" />
            Scores, Grades & Academic Progress
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review detailed marks, feedback from instructors, and class-by-class performance metrics.
          </p>
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="input-field bg-white text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200"
        >
          <option value="all">All Enrolled Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overall Average</span>
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {avgPercentage !== null ? `${avgPercentage}%` : "No scores yet"}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            {avgPercentage !== null ? `Equivalent Grade: ${getLetterGrade(avgPercentage)}` : "Awaiting graded work"}
          </span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Graded Assessments</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {totalGraded}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Completed & evaluated tasks</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Courses</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {classes.length}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Current enrolled curriculum</span>
        </div>
      </div>

      {/* Report Card Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Academic Scorecard</h3>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No graded submissions available for this selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Teacher Feedback</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {sub.assignment.class.name}
                    </td>

                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {sub.assignment.title}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {sub.grade.score} / {sub.assignment.totalPoints}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold ${
                          sub.grade.percentage >= 85
                            ? "text-emerald-600"
                            : sub.grade.percentage >= 70
                            ? "text-primary-600"
                            : "text-red-600"
                        }`}
                      >
                        {Math.round(sub.grade.percentage)}% ({getLetterGrade(sub.grade.percentage)})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-600">
                      {sub.grade.feedback ? (
                        <span className="italic line-clamp-2">&ldquo;{sub.grade.feedback}&rdquo;</span>
                      ) : (
                        <span className="text-slate-400 italic">No notes</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/student/assignments/${sub.assignment.id}`}
                        className="text-primary-600 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Details
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
