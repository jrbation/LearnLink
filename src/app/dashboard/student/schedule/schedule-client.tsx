"use client";

import { useState } from "react";
import {
  Calendar,
  Video,
  Clock,
  School,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Props {
  schedules: any[];
}

export function StudentScheduleClient({ schedules }: Props) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const now = new Date();

  const upcoming = schedules.filter((s) => new Date(s.endTime) >= now);
  const past = schedules.filter((s) => new Date(s.endTime) < now);

  const displayList = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-600" />
            Class Schedule & Remote Video Classrooms
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your live lecture sessions, group meetings, and review past attendance.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab("upcoming")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              tab === "upcoming"
                ? "bg-primary-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setTab("past")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              tab === "past"
                ? "bg-primary-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Past Sessions ({past.length})
          </button>
        </div>
      </div>

      {/* Sessions Grid */}
      {displayList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            {tab === "upcoming" ? "No upcoming live sessions" : "No past sessions found"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {tab === "upcoming"
              ? "Check back later when your teachers schedule new live remote classes."
              : "Past class records will appear here after sessions conclude."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayList.map((sch) => {
            const myAttendance = sch.attendance[0];

            return (
              <div
                key={sch.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge badge-primary text-[10px] font-bold">
                      {sch.class.name}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {new Date(sch.startTime).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{sch.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Teacher: {sch.class.teacher.name}</span>
                  </div>

                  {sch.description && (
                    <p className="text-xs text-slate-600 mt-2">{sch.description}</p>
                  )}

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-700 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(sch.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(sch.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {myAttendance && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 mt-1">
                        <span className="text-slate-400">Attendance:</span>
                        <span
                          className={`badge text-[10px] font-bold ${
                            myAttendance.status === "PRESENT"
                              ? "badge-success"
                              : myAttendance.status === "LATE"
                              ? "badge-warning"
                              : "badge-danger"
                          }`}
                        >
                          {myAttendance.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {sch.meetingLink ? "Video meeting enabled" : "No link provided"}
                  </span>

                  {sch.meetingLink && (
                    <a
                      href={sch.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Video Meeting
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
