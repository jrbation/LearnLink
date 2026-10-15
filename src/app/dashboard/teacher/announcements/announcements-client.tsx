"use client";

import { useState } from "react";
import {
  Megaphone,
  Plus,
  Pin,
  Trash2,
  Users,
  Search,
  Sparkles,
} from "lucide-react";

interface Props {
  initialAnnouncements: any[];
  classes: any[];
  selectedClassId?: string;
}

export function TeacherAnnouncementsClient({
  initialAnnouncements,
  classes,
  selectedClassId,
}: Props) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [classFilter, setClassFilter] = useState(selectedClassId || "all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    classId: classes[0]?.id || "",
    title: "",
    message: "",
    targetAudience: "all" as "all" | "students" | "parents",
    isPinned: false,
  });

  const filtered = announcements.filter((a) => {
    const matchesClass =
      classFilter === "all" || a.classId === classFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create announcement");

      const created = {
        ...data.announcement,
        class: classes.find((c) => c.id === formData.classId) || null,
      };

      setAnnouncements([created, ...announcements]);
      setShowModal(false);
      setFormData({
        classId: classes[0]?.id || "",
        title: "",
        message: "",
        targetAudience: "all",
        isPinned: false,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAnnouncements(announcements.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary-600" />
            Class Notices & Announcement Board
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Broadcast messages and reminders directly to students and parents with instant push notifications.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="input-field w-full h-full bg-white text-xs font-semibold py-3 px-3 rounded-xl border border-slate-200"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No announcements posted</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Send an update or reminder to your enrolled students or their parents.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs px-4 py-2 rounded-xl"
          >
            Post Notice
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-6 transition-all shadow-xs ${
                item.isPinned ? "border-amber-300 bg-amber-50/20" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
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
                    <span className="badge badge-neutral text-[10px]">
                      Audience: {item.targetAudience === "all" ? "Students & Parents" : item.targetAudience}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Posted {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                Post Announcement
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
                  Class Room
                </label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="input-field w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                >
                  <option value="">General (All My Classes)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Audience *
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                  className="input-field w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                >
                  <option value="all">Everyone (Students & Parents)</option>
                  <option value="students">Students Only</option>
                  <option value="parents">Parents Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Reminder: Science Project Milestone Due Friday"
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Content *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write notice details, requirements, or instructions..."
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isPinned" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Pin to top of notice board
                </label>
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
                  {isSubmitting ? "Posting..." : "Broadcast Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
