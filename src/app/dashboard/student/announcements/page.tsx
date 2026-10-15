import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Megaphone, Pin, School, User } from "lucide-react";

export default async function StudentAnnouncementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "STUDENT") redirect("/unauthorized");

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id, status: "ACTIVE" },
    select: { classId: true },
  });

  const enrolledClassIds = enrollments.map((e) => e.classId);

  const announcements = await prisma.announcement.findMany({
    where: {
      targetAudience: { in: ["all", "students"] },
      classId: { in: enrolledClassIds },
    },
    include: {
      class: { select: { id: true, name: true, subject: true } },
      teacher: { select: { name: true, avatar: true } },
    },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <DashboardShell
      role="STUDENT"
      user={{
        name: session.user.name || "Student",
        email: session.user.email || "",
        role: "STUDENT",
      }}
    >
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary-600" />
            Class Notices & Announcements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Important updates, homework reminders, and school schedule adjustments from your teachers.
          </p>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900">No announcements posted</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Your teachers will post updates and course announcements here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-6 shadow-xs ${
                  item.isPinned ? "border-amber-300 bg-amber-50/20" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {item.isPinned && (
                      <span className="badge badge-warning text-[10px] font-bold flex items-center gap-1">
                        <Pin className="w-3 h-3" />
                        Pinned Notice
                      </span>
                    )}
                    {item.class && (
                      <span className="badge badge-primary text-[10px] font-bold">
                        {item.class.name}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Posted {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-3">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Instructor: {item.teacher.name}</span>
                </div>

                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
