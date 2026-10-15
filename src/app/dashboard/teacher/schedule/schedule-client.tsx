"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Video,
  Clock,
  School,
  ExternalLink,
  UserCheck,
  Sparkles,
} from "lucide-react";

interface Props {
  initialSchedules: any[];
  classes: any[];
  selectedClassId?: string;
}

export function TeacherScheduleClient({ initialSchedules, classes, selectedClassId }: Props) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [classFilter, setClassFilter] = useState(selectedClassId || "all");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    classId: classes[0]?.id || "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    meetingLink: "",
  });

  const filtered = schedules.filter((s) => classFilter === "all" || s.classId === classFilter);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule class");

      const created = {
        ...data.schedule,
        class: classes.find((c) => c.id === formData.classId) || { name: "Class", subject: "" },
        _count: { attendance: 0 },
      };

      setSchedules([...schedules, created]);
      setShowModal(false);
      setFormData({
        classId: classes[0]?.id || "",
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        meetingLink: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-600" />
            Class Schedule & Live Sessions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize live video classes, review schedules, and coordinate remote learning meetings.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Session</span>
        </button>
      </div>

      <div className="flex justify-end">
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="input-field bg-white text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200"
        >
          <option value="all">All Classes ({classes.length})</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No scheduled sessions</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Plan your next online class, guest lecture, or office hours session.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs px-4 py-2 rounded-xl"
          >
            Schedule Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-primary text-[10px] font-bold">
                    {item.class.name}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {new Date(item.startTime).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                )}

                <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {item.meetingLink && (
                    <div className="flex items-center gap-2 truncate">
                      <Video className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline truncate"
                      >
                        {item.meetingLink}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/dashboard/teacher/attendance`}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  Take Attendance ({item._count?.attendance || 0})
                </Link>

                {item.meetingLink && (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Start Session
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                Schedule Live Class
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Class *
                </label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="input-field w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Week 4: Live Lecture & Q&A Discussion"
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="input-field w-full text-xs py-2 px-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="input-field w-full text-xs py-2 px-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Video Meeting URL (Google Meet, Zoom, MS Teams, etc.)
                </label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/xyz-abc-def"
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Session Agenda / Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Topics to prepare, homework questions to be solved..."
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary px-4 py-2 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-5 py-2 text-xs font-medium rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
