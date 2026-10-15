"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface Props {
  parentLinks: any[];
}

export function ParentScheduleClient({ parentLinks }: Props) {
  const children = parentLinks.map((p) => p.child);
  const [selectedChildId, setSelectedChildId] = useState(
    children[0]?.id || ""
  );

  const selectedChild = children.find((c) => c.id === selectedChildId);

  // Extract all schedules for selected child
  const allSchedules: any[] = [];
  if (selectedChild) {
    for (const enr of selectedChild.enrollments) {
      for (const sch of enr.class.schedules) {
        allSchedules.push({
          ...sch,
          className: enr.class.name,
          subject: enr.class.subject,
          teacherName: enr.class.teacher.name,
          myAttendance: sch.attendance.find((a: any) => a.studentId === selectedChild.id),
        });
      }
    }
  }

  // Sort by startTime
  allSchedules.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const now = new Date();
  const upcoming = allSchedules.filter((s) => new Date(s.endTime) >= now);
  const past = allSchedules.filter((s) => new Date(s.endTime) < now);

  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const displayList = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-600" />
            Child Class Schedule & Live Lectures
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor class meeting times, video classroom links, and verify your child&apos;s attendance.
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
                  {c.name}&apos;s Schedule
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("upcoming")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            tab === "upcoming"
              ? "bg-primary-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Upcoming Live Classes ({upcoming.length})
        </button>
        <button
          onClick={() => setTab("past")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            tab === "past"
              ? "bg-primary-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Past Class History ({past.length})
        </button>
      </div>

      {/* Grid */}
      {displayList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            {tab === "upcoming" ? "No upcoming live sessions" : "No past classes recorded"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {selectedChild?.name || "Your child"} does not have any sessions in this view.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-primary text-[10px] font-bold">
                    {item.className}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {new Date(item.startTime).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Teacher: {item.teacherName}</span>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-600 mt-2">{item.description}</p>
                )}

                <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {item.myAttendance && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50">
                      <span className="text-slate-400">Attendance:</span>
                      <span
                        className={`badge text-[10px] font-bold ${
                          item.myAttendance.status === "PRESENT"
                            ? "badge-success"
                            : item.myAttendance.status === "LATE"
                            ? "badge-warning"
                            : "badge-danger"
                        }`}
                      >
                        {item.myAttendance.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {item.meetingLink ? "Remote video enabled" : "In-person / Offline"}
                </span>

                {item.meetingLink && (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Open Video Meeting
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
