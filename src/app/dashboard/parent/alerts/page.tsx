import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  UserX,
  Award,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default async function ParentAlertsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "PARENT") redirect("/unauthorized");

  const parentLinks = await prisma.parentChild.findMany({
    where: { parentId: session.user.id, status: "ACTIVE" },
    include: {
      child: {
        include: {
          enrollments: {
            where: { status: "ACTIVE" },
            include: {
              class: {
                include: {
                  teacher: { select: { name: true, email: true } },
                  assignments: {
                    where: { status: "PUBLISHED" },
                    include: {
                      submissions: {
                        include: { grade: true },
                      },
                    },
                  },
                },
              },
            },
          },
          attendanceRecords: {
            where: {
              status: { in: ["ABSENT", "LATE"] },
            },
            include: {
              schedule: {
                include: { class: { select: { name: true } } },
              },
            },
            orderBy: { markedAt: "desc" },
          },
        },
      },
    },
  });

  const now = new Date();
  const alerts: any[] = [];

  for (const link of parentLinks) {
    const child = link.child;

    // Check attendance flags
    for (const att of child.attendanceRecords) {
      alerts.push({
        id: `att-${att.id}`,
        type: att.status === "ABSENT" ? "ABSENT" : "LATE",
        severity: att.status === "ABSENT" ? "high" : "medium",
        childName: child.name,
        title: `Attendance Alert: Marked ${att.status}`,
        message: `${child.name} was marked ${att.status} for "${att.schedule.title}" in ${att.schedule.class.name}.`,
        date: att.markedAt,
        actionUrl: "/dashboard/parent/schedule",
      });
    }

    // Check assignments for overdue or low grades
    for (const enr of child.enrollments) {
      for (const asg of enr.class.assignments) {
        const sub = asg.submissions.find((s) => s.studentId === child.id);
        const isSubmitted = !!sub && sub.status !== "DRAFT";

        // Overdue check
        if (!isSubmitted && asg.dueDate && new Date(asg.dueDate) < now) {
          alerts.push({
            id: `overdue-${asg.id}-${child.id}`,
            type: "OVERDUE",
            severity: "high",
            childName: child.name,
            title: `Overdue Task: ${asg.title}`,
            message: `${child.name} has not submitted this ${asg.type.toLowerCase()} for ${enr.class.name}. Due date was ${new Date(asg.dueDate).toLocaleDateString()}.`,
            date: asg.dueDate,
            actionUrl: "/dashboard/parent/academics",
          });
        }

        // Low grade check (< 70%)
        if (sub?.grade && sub.grade.percentage < 70) {
          alerts.push({
            id: `low-grade-${sub.id}`,
            type: "LOW_GRADE",
            severity: "medium",
            childName: child.name,
            title: `Low Score Flag: ${asg.title}`,
            message: `${child.name} scored ${sub.grade.score}/${asg.totalPoints} (${Math.round(sub.grade.percentage)}%) in ${enr.class.name}. Teacher feedback: "${sub.grade.feedback || 'None provided'}"`,
            date: sub.grade.gradedAt,
            actionUrl: "/dashboard/parent/progress",
          });
        }
      }
    }
  }

  // Sort alerts by date desc
  alerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardShell
      role="PARENT"
      user={{
        name: session.user.name || "Parent",
        email: session.user.email || "",
        role: "PARENT",
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              Learning Alerts & Risk Indicators
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Automated notifications for missing homework, class absences, and low scores requiring attention.
            </p>
          </div>
          <span className={`badge ${alerts.length > 0 ? "badge-danger" : "badge-success"} text-xs font-bold py-1 px-3`}>
            {alerts.length} Active {alerts.length === 1 ? "Alert" : "Alerts"}
          </span>
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">All Clear! No Active Alerts</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Your linked children have no overdue assignments, attendance concerns, or low scores.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  alert.severity === "high" ? "border-red-200 bg-red-50/20" : "border-amber-200 bg-amber-50/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      alert.type === "ABSENT"
                        ? "bg-red-100 text-red-700"
                        : alert.type === "LATE"
                        ? "bg-amber-100 text-amber-700"
                        : alert.type === "OVERDUE"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {alert.type === "ABSENT" ? (
                      <UserX className="w-5 h-5" />
                    ) : alert.type === "LATE" ? (
                      <Clock className="w-5 h-5" />
                    ) : alert.type === "OVERDUE" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Award className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge badge-primary text-[10px] font-bold">
                        {alert.childName}
                      </span>
                      <span
                        className={`badge text-[10px] font-bold ${
                          alert.severity === "high" ? "badge-danger" : "badge-warning"
                        }`}
                      >
                        {alert.type}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(alert.date).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{alert.title}</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href={alert.actionUrl}
                    className="btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
