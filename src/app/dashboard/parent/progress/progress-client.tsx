"use client";

import { useState } from "react";
import {
  BarChart3,
  Award,
  UserCheck,
  ClipboardCheck,
  TrendingUp,
  School,
  Users,
  CheckCircle2,
} from "lucide-react";

interface Props {
  parentLinks: any[];
}

export function ParentProgressClient({ parentLinks }: Props) {
  const children = parentLinks.map((p) => p.child);
  const [selectedChildId, setSelectedChildId] = useState(
    children[0]?.id || ""
  );

  const selectedChild = children.find((c) => c.id === selectedChildId);

  // Compute stats for current child
  const classBreakdown =
    selectedChild?.enrollments.map((enr: any) => {
      const cls = enr.class;
      const assignments = cls.assignments || [];

      let totalScores = 0;
      let gradedCount = 0;
      const gradedItems: any[] = [];

      for (const asg of assignments) {
        const sub = asg.submissions.find(
          (s: any) => s.studentId === selectedChild.id
        );
        if (sub?.grade) {
          totalScores += sub.grade.percentage;
          gradedCount++;
          gradedItems.push({
            assignmentTitle: asg.title,
            score: sub.grade.score,
            maxScore: asg.totalPoints,
            percentage: sub.grade.percentage,
            feedback: sub.grade.feedback,
            gradedAt: sub.grade.gradedAt,
          });
        }
      }

      const avgScore =
        gradedCount > 0 ? Math.round(totalScores / gradedCount) : null;

      return {
        classId: cls.id,
        className: cls.name,
        subject: cls.subject,
        teacherName: cls.teacher.name,
        avgScore,
        gradedCount,
        totalTasks: assignments.length,
        gradedItems,
      };
    }) || [];

  // Cumulative average
  const validScores = classBreakdown
    .map((c: any) => c.avgScore)
    .filter((s: any) => s !== null);
  const cumulativeAvg =
    validScores.length > 0
      ? Math.round(validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length)
      : null;

  // Attendance stats
  const attendanceRecords = selectedChild?.attendanceRecords || [];
  const totalAttendance = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(
    (a: any) => a.status === "PRESENT" || a.status === "EXCUSED"
  ).length;
  const attendanceRate =
    totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-600" />
            Child Academic Progress & Report Cards
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Detailed performance tracking, score breakdowns by subject, and teacher evaluations.
          </p>
        </div>

        {children.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <Users className="w-4 h-4 text-slate-400 ml-1" />
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 border-none focus:outline-none"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}&apos;s Progress
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overall Grade Average</span>
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {cumulativeAvg !== null ? `${cumulativeAvg}%` : "No scores"}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Across {classBreakdown.length} enrolled subjects
          </span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Attendance Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {attendanceRate}%
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            {presentCount} of {totalAttendance} sessions attended
          </span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Courses</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {classBreakdown.length}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Enrolled class rooms</span>
        </div>
      </div>

      {/* Subject by Subject Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Subject Performance Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classBreakdown.map((item: any) => (
            <div
              key={item.classId}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="badge badge-primary text-[10px] font-bold">
                    {item.subject}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{item.className}</h4>
                  <p className="text-xs text-slate-400">Teacher: {item.teacherName}</p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-bold text-slate-900 block">
                    {item.avgScore !== null ? `${item.avgScore}%` : "—"}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Class Avg
                  </span>
                </div>
              </div>

              {/* Graded Items list */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Graded Work ({item.gradedItems.length}):
                </span>

                {item.gradedItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No evaluated tasks yet.</p>
                ) : (
                  item.gradedItems.map((g: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{g.assignmentTitle}</span>
                        <span className="text-primary-700">
                          {g.score} / {g.maxScore} ({Math.round(g.percentage)}%)
                        </span>
                      </div>
                      {g.feedback && (
                        <p className="text-[11px] text-slate-600 italic">
                          Feedback: &ldquo;{g.feedback}&rdquo;
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
