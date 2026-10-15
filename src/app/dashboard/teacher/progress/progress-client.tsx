"use client";

import { useState } from "react";
import {
  BarChart3,
  Award,
  UserCheck,
  ClipboardCheck,
  AlertTriangle,
  School,
  TrendingUp,
  Search,
} from "lucide-react";

interface Props {
  classes: any[];
}

export function TeacherProgressClient({ classes }: Props) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [search, setSearch] = useState("");

  const currentClass = classes.find((c) => c.id === selectedClassId);

  // Compute metrics for current class
  const students = currentClass?.enrollments.map((e: any) => e.student) || [];
  const assignments = currentClass?.assignments || [];
  const totalAssignments = assignments.length;

  const studentStats = students.map((st: any) => {
    // Grades
    const studentGrades: number[] = [];
    let completedCount = 0;

    for (const asg of assignments) {
      const sub = asg.submissions.find((s: any) => s.studentId === st.id);
      if (sub && sub.status !== "DRAFT") {
        completedCount++;
        if (sub.grade) {
          studentGrades.push(sub.grade.percentage);
        }
      }
    }

    const avgScore =
      studentGrades.length > 0
        ? Math.round(
            studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length
          )
        : null;

    // Attendance
    let presentCount = 0;
    let totalSessions = 0;
    let absentCount = 0;

    for (const sch of currentClass?.schedules || []) {
      const att = sch.attendance.find((a: any) => a.studentId === st.id);
      if (att) {
        totalSessions++;
        if (att.status === "PRESENT" || att.status === "EXCUSED") {
          presentCount++;
        } else if (att.status === "ABSENT") {
          absentCount++;
        }
      }
    }

    const attendanceRate =
      totalSessions > 0
        ? Math.round((presentCount / totalSessions) * 100)
        : 100;

    const isAtRisk = (avgScore !== null && avgScore < 70) || absentCount >= 2;

    return {
      student: st,
      avgScore,
      completedCount,
      totalAssignments,
      attendanceRate,
      absentCount,
      isAtRisk,
    };
  });

  const filteredStats = studentStats.filter((s: any) =>
    s.student.name.toLowerCase().includes(search.toLowerCase())
  );

  // Class aggregates
  const validScores = studentStats
    .map((s: any) => s.avgScore)
    .filter((s: any) => s !== null);
  const classAvgScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length)
      : null;

  const atRiskCount = studentStats.filter((s: any) => s.isAtRisk).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-600" />
            Student Academic Progress & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor class performance distributions, task completion rates, and identify at-risk learners.
          </p>
        </div>

        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="input-field bg-white text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Aggregate Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Class Average Score</span>
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {classAvgScore !== null ? `${classAvgScore}%` : "No grades yet"}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Across {assignments.length} assigned assessments
          </span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Enrolled Learners</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {students.length}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Active students in this class</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">At-Risk Alerts</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${atRiskCount > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold mt-2 ${atRiskCount > 0 ? "text-amber-600" : "text-slate-900"}`}>
            {atRiskCount} {atRiskCount === 1 ? "Student" : "Students"}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Average &lt; 70% or multiple absences
          </span>
        </div>
      </div>

      {/* Student Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name..."
              className="w-full text-xs bg-transparent border-none focus:outline-none"
            />
          </div>
        </div>

        {filteredStats.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No student data found for this class.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Average Grade</th>
                  <th className="py-3 px-4">Completed Tasks</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Status Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStats.map((item: any) => (
                  <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold text-[10px] flex items-center justify-center">
                          {item.student.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{item.student.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{item.student.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.avgScore !== null ? (
                        <span
                          className={`font-bold ${
                            item.avgScore >= 85
                              ? "text-emerald-600"
                              : item.avgScore >= 70
                              ? "text-primary-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.avgScore}%
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not graded</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {item.completedCount} / {item.totalAssignments} tasks
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {item.attendanceRate}%
                      </span>
                      {item.absentCount > 0 && (
                        <span className="text-[10px] text-red-500 block">
                          {item.absentCount} absences
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {item.isAtRisk ? (
                        <span className="badge badge-danger text-[10px] font-semibold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Needs Attention
                        </span>
                      ) : (
                        <span className="badge badge-success text-[10px] font-semibold w-fit">
                          On Track
                        </span>
                      )}
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
