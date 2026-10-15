import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import Link from "next/link";
import {
  School,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Megaphone,
  Award,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { formatDate, formatDateTime, getGradeBadgeColor, getRelativeTime } from "@/lib/utils";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") redirect("/auth/signin");

  const userId = session.user.id;

  const [enrollments, submissions, upcomingSchedules, announcements] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId: userId, status: "ACTIVE" },
      include: {
        class: {
          include: {
            teacher: { select: { name: true } },
            _count: { select: { lessons: true, assignments: true } },
          },
        },
      },
    }),
    prisma.submission.findMany({
      where: { studentId: userId },
      include: {
        assignment: { select: { title: true, type: true, dueDate: true, totalPoints: true, class: { select: { name: true } } } },
        grade: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.schedule.findMany({
      where: {
        class: { enrollments: { some: { studentId: userId, status: "ACTIVE" } } },
        startTime: { gte: new Date() },
        status: "SCHEDULED",
      },
      include: { class: { select: { name: true, subject: true } } },
      orderBy: { startTime: "asc" },
      take: 4,
    }),
    prisma.announcement.findMany({
      where: {
        class: { enrollments: { some: { studentId: userId, status: "ACTIVE" } } },
        targetAudience: { in: ["all", "students"] },
      },
      include: {
        class: { select: { name: true } },
        teacher: { select: { name: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  // Pending assignments
  const pendingAssignments = await prisma.assignment.findMany({
    where: {
      class: { enrollments: { some: { studentId: userId, status: "ACTIVE" } } },
      status: "PUBLISHED",
      submissions: { none: { studentId: userId } },
    },
    include: { class: { select: { name: true } } },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  const gradedSubmissions = submissions.filter((s) => s.grade);

  return (
    <DashboardShell user={session.user as any}>
      <div className="page-header">
        <h1>Welcome, {session.user.name?.split(" ")[0]}!</h1>
        <p>Here&apos;s your learning activity and upcoming deadlines.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Enrolled Classes", value: enrollments.length, icon: School, color: "blue", iconBg: "bg-primary-50 text-primary-600" },
          { label: "Pending Tasks", value: pendingAssignments.length, icon: ClipboardCheck, color: "orange", iconBg: "bg-amber-50 text-amber-600" },
          { label: "Graded Work", value: gradedSubmissions.length, icon: Award, color: "green", iconBg: "bg-emerald-50 text-emerald-600" },
          { label: "Upcoming Classes", value: upcomingSchedules.length, icon: Calendar, color: "purple", iconBg: "bg-violet-50 text-violet-600" },
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
          {/* Pending Assignments */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Pending Assignments
              </h2>
              <Link href="/dashboard/student/assignments" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {pendingAssignments.length === 0 ? (
              <div className="empty-state py-8">
                <div className="empty-state-icon"><CheckCircle2 className="w-6 h-6" /></div>
                <p className="text-sm text-slate-500">All assignments completed!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.map((a) => {
                  const overdue = a.dueDate && new Date(a.dueDate) < new Date();
                  return (
                    <Link
                      key={a.id}
                      href={`/dashboard/student/assignments/${a.id}`}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                        overdue
                          ? "bg-red-50/50 border-red-100 hover:bg-red-50"
                          : "bg-slate-50 border-transparent hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">{a.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{a.class.name}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`badge ${overdue ? "badge-danger" : "badge-warning"}`}>
                          {overdue ? "Overdue" : "Due"}
                        </span>
                        {a.dueDate && (
                          <div className="text-[10px] text-slate-400 mt-1">{formatDate(a.dueDate)}</div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Schedule */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                Upcoming Remote Classes
              </h2>
              <Link href="/dashboard/student/schedule" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                Full schedule <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {upcomingSchedules.length === 0 ? (
              <div className="empty-state py-8">
                <div className="empty-state-icon"><Calendar className="w-6 h-6" /></div>
                <p className="text-sm text-slate-500">No upcoming sessions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map((s) => (
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
          {/* Recent Grades */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                Recent Grades
              </h2>
              <Link href="/dashboard/student/grades" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {gradedSubmissions.length === 0 ? (
              <div className="empty-state py-6">
                <p className="text-sm text-slate-500">No grades released yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gradedSubmissions.map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-medium text-slate-800 truncate">{s.assignment.title}</div>
                      <span className={`badge ${getGradeBadgeColor(s.grade!.percentage)}`}>
                        {s.grade!.percentage}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">{s.assignment.class.name}</div>
                    {s.grade!.feedback && (
                      <div className="text-[10px] text-slate-400 mt-1 italic line-clamp-2">&ldquo;{s.grade!.feedback}&rdquo;</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-500" />
                Announcements
              </h2>
              <Link href="/dashboard/student/announcements" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {announcements.length === 0 ? (
              <div className="empty-state py-6"><p className="text-sm text-slate-500">No announcements.</p></div>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                    <div className="text-xs font-semibold text-slate-800 truncate">{a.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{a.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1.5">{a.class?.name} • {getRelativeTime(a.publishedAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
