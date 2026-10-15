import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import Link from "next/link";
import {
  School,
  Users,
  ClipboardCheck,
  Calendar,
  Megaphone,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatDate, formatDateTime, getGradeBadgeColor, getRelativeTime } from "@/lib/utils";

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") redirect("/auth/signin");

  const userId = session.user.id;

  // Fetch all teacher data in parallel
  const [classes, recentSubmissions, upcomingSchedules, announcements, pendingCount] =
    await Promise.all([
      prisma.class.findMany({
        where: { teacherId: userId, status: "ACTIVE" },
        include: {
          enrollments: { where: { status: "ACTIVE" } },
          _count: { select: { lessons: true, assignments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.submission.findMany({
        where: {
          assignment: { class: { teacherId: userId } },
          status: { in: ["SUBMITTED", "LATE"] },
        },
        include: {
          student: { select: { name: true } },
          assignment: { select: { title: true, type: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
      prisma.schedule.findMany({
        where: {
          class: { teacherId: userId },
          startTime: { gte: new Date() },
          status: "SCHEDULED",
        },
        include: { class: { select: { name: true, subject: true } } },
        orderBy: { startTime: "asc" },
        take: 4,
      }),
      prisma.announcement.findMany({
        where: { teacherId: userId },
        include: { class: { select: { name: true } } },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      prisma.submission.count({
        where: {
          assignment: { class: { teacherId: userId } },
          status: { in: ["SUBMITTED", "LATE"] },
        },
      }),
    ]);

  const totalStudents = classes.reduce((sum, c) => sum + c.enrollments.length, 0);

  return (
    <DashboardShell user={session.user as any}>
      <div className="page-header">
        <h1>Welcome back, {session.user.name?.split(" ")[0]}!</h1>
        <p>Here&apos;s an overview of your classes and student activity.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Active Classes",
            value: classes.length,
            icon: School,
            color: "blue",
            iconBg: "bg-primary-50 text-primary-600",
          },
          {
            label: "Enrolled Students",
            value: totalStudents,
            icon: Users,
            color: "green",
            iconBg: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Pending Reviews",
            value: pendingCount,
            icon: ClipboardCheck,
            color: "orange",
            iconBg: "bg-amber-50 text-amber-600",
          },
          {
            label: "Upcoming Classes",
            value: upcomingSchedules.length,
            icon: Calendar,
            color: "purple",
            iconBg: "bg-violet-50 text-violet-600",
          },
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
        {/* Left Column: Recent Submissions + Upcoming Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Submissions */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Submissions to Review
              </h2>
              <Link href="/dashboard/teacher/assignments" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentSubmissions.length === 0 ? (
              <div className="empty-state py-8">
                <div className="empty-state-icon">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-500">All caught up! No pending reviews.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{sub.student.name}</div>
                      <div className="text-xs text-slate-500 truncate">{sub.assignment.title}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`badge ${sub.status === "LATE" ? "badge-danger" : "badge-warning"}`}>
                        {sub.status === "LATE" ? "Late" : "Pending"}
                      </span>
                      {sub.submittedAt && (
                        <span className="text-[10px] text-slate-400">{getRelativeTime(sub.submittedAt)}</span>
                      )}
                    </div>
                  </div>
                ))}
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
              <Link href="/dashboard/teacher/schedule" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {upcomingSchedules.length === 0 ? (
              <div className="empty-state py-8">
                <div className="empty-state-icon">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-500">No upcoming sessions scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map((sched) => (
                  <div key={sched.id} className="flex items-center justify-between p-3 rounded-xl bg-primary-50/50 border border-primary-100">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800">{sched.title}</div>
                      <div className="text-xs text-slate-500">{sched.class.name} • {sched.class.subject}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-primary-700">{formatDate(sched.startTime)}</div>
                      <div className="text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDateTime(sched.startTime).split(",").pop()?.trim()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Classes + Announcements */}
        <div className="space-y-6">
          {/* My Classes Quick View */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <School className="w-4 h-4 text-primary-500" />
                My Classes
              </h2>
              <Link href="/dashboard/teacher/classes" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {classes.length === 0 ? (
              <div className="empty-state py-6">
                <p className="text-sm text-slate-500 mb-3">No classes yet.</p>
                <Link href="/dashboard/teacher/classes" className="btn btn-primary btn-sm">
                  Create Your First Class
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {classes.slice(0, 4).map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/dashboard/teacher/classes/${cls.id}`}
                    className="block p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="font-medium text-sm text-slate-800 truncate">{cls.name}</div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cls.enrollments.length} students</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {cls._count.lessons} lessons</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Announcements */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-500" />
                Announcements
              </h2>
              <Link href="/dashboard/teacher/announcements" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                Post <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {announcements.length === 0 ? (
              <div className="empty-state py-6">
                <p className="text-sm text-slate-500">No announcements yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                    <div className="text-xs font-semibold text-slate-800 truncate">{ann.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{ann.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1.5">
                      {ann.class?.name || "All Classes"} • {getRelativeTime(ann.publishedAt)}
                    </div>
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
