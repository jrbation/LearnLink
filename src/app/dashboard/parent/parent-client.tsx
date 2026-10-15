"use client";

import { useState } from "react";
import Link from "next/link";
import {
  School,
  Users,
  ClipboardCheck,
  Calendar,
  Megaphone,
  Award,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { formatDate, formatDateTime, getGradeBadgeColor, getRelativeTime, getAttendanceColor } from "@/lib/utils";

interface ChildInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface ParentDashboardClientProps {
  children: ChildInfo[];
  initialChildData: any;
  initialChildId: string;
}

export function ParentDashboardClient({ children, initialChildData, initialChildId }: ParentDashboardClientProps) {
  const [activeChildId, setActiveChildId] = useState(initialChildId);
  const [childData, setChildData] = useState(initialChildData);
  const [loading, setLoading] = useState(false);
  const [showChildSelector, setShowChildSelector] = useState(false);

  const activeChild = children.find((c) => c.id === activeChildId)!;

  const switchChild = async (childId: string) => {
    if (childId === activeChildId) {
      setShowChildSelector(false);
      return;
    }
    setLoading(true);
    setShowChildSelector(false);

    try {
      const res = await fetch(`/api/parent/child-data?childId=${childId}`);
      if (res.ok) {
        const data = await res.json();
        setChildData(data);
        setActiveChildId(childId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const { enrollments, submissions, upcomingSchedules, announcements, attendance, pendingAssignments } = childData;
  const gradedSubmissions = submissions.filter((s: any) => s.grade);
  const overdueAssignments = pendingAssignments.filter((a: any) => a.dueDate && new Date(a.dueDate) < new Date());

  return (
    <div className={loading ? "opacity-50 pointer-events-none transition-opacity" : ""}>
      {/* Header with Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div className="page-header mb-0">
          <h1>{activeChild.name}&apos;s Dashboard</h1>
          <p>Academic overview, schedule, and announcements for your child.</p>
        </div>

        {children.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowChildSelector(!showChildSelector)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Switch Child
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showChildSelector && (
              <div className="dropdown-menu w-60">
                {children.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => switchChild(c.id)}
                    className={`dropdown-item w-full text-left ${c.id === activeChildId ? "bg-primary-50 text-primary-700 font-semibold" : ""}`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-accent text-white flex items-center justify-center text-xs font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.email}</div>
                    </div>
                    {c.id === activeChildId && <CheckCircle2 className="w-4 h-4 text-primary-600 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Enrolled Classes", value: enrollments.length, icon: School, color: "blue", iconBg: "bg-primary-50 text-primary-600" },
          { label: "Pending Tasks", value: pendingAssignments.length, icon: ClipboardCheck, color: "orange", iconBg: "bg-amber-50 text-amber-600" },
          { label: "Graded Work", value: gradedSubmissions.length, icon: Award, color: "green", iconBg: "bg-emerald-50 text-emerald-600" },
          { label: "Overdue Items", value: overdueAssignments.length, icon: AlertTriangle, color: "purple", iconBg: "bg-red-50 text-red-600" },
        ].map((stat, i) => (
          <div key={i} className={`card stat-card ${stat.color} p-5`}>
            <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Parent Announcement Board */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-500" />
                Announcement Board
              </h2>
              <Link href="/dashboard/parent/announcements" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {announcements.length === 0 ? (
              <div className="empty-state py-8">
                <div className="empty-state-icon"><Megaphone className="w-6 h-6" /></div>
                <p className="text-sm text-slate-500">No announcements from your child&apos;s teachers.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((a: any) => (
                  <div key={a.id} className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold text-slate-800">{a.title}</div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-3">{getRelativeTime(a.publishedAt)}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{a.message}</p>
                    <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                      <School className="w-3 h-3" />
                      {a.class?.name || "General"} • {a.teacher?.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Class Schedule */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                Upcoming Classes
              </h2>
              <Link href="/dashboard/parent/schedule" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                Full schedule <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {upcomingSchedules.length === 0 ? (
              <div className="empty-state py-8"><div className="empty-state-icon"><Calendar className="w-6 h-6" /></div><p className="text-sm text-slate-500">No upcoming sessions.</p></div>
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-primary-50/50 border border-primary-100">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800">{s.title}</div>
                      <div className="text-xs text-slate-500">{s.class.name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-primary-700">{formatDate(s.startTime)}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />{formatDateTime(s.startTime).split(",").pop()?.trim()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Grades & Progress */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                Recent Grades
              </h2>
              <Link href="/dashboard/parent/progress" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                Report <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {gradedSubmissions.length === 0 ? (
              <div className="empty-state py-6"><p className="text-sm text-slate-500">No grades released yet.</p></div>
            ) : (
              <div className="space-y-3">
                {gradedSubmissions.slice(0, 4).map((s: any) => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-medium text-slate-800 truncate">{s.assignment.title}</div>
                      <span className={`badge ${getGradeBadgeColor(s.grade.percentage)}`}>{s.grade.percentage}%</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{s.assignment.class.name}</div>
                    {s.grade.feedback && (
                      <div className="text-[10px] text-slate-400 mt-1 italic line-clamp-2">&ldquo;{s.grade.feedback}&rdquo;</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-500" />
                Attendance
              </h2>
            </div>
            {attendance.length === 0 ? (
              <div className="empty-state py-6"><p className="text-sm text-slate-500">No attendance records yet.</p></div>
            ) : (
              <div className="space-y-3">
                {attendance.slice(0, 5).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-700 truncate">{a.schedule.title}</div>
                      <div className="text-[10px] text-slate-400">{a.schedule.class.name} • {formatDate(a.schedule.startTime)}</div>
                    </div>
                    <span className={`badge ${getAttendanceColor(a.status)}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing / Overdue */}
          {overdueAssignments.length > 0 && (
            <div className="card p-6 border-red-200 bg-red-50/30">
              <h2 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Overdue Assignments
              </h2>
              <div className="space-y-2">
                {overdueAssignments.map((a: any) => (
                  <div key={a.id} className="p-2.5 rounded-lg bg-red-50 border border-red-100">
                    <div className="text-xs font-medium text-red-800">{a.title}</div>
                    <div className="text-[10px] text-red-600">{a.class.name} • Due {formatDate(a.dueDate)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
