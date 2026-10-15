"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  School,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Paperclip,
} from "lucide-react";

interface Props {
  initialLessons: any[];
  classes: any[];
  selectedClassId?: string;
}

export function TeacherLessonsClient({ initialLessons, classes, selectedClassId }: Props) {
  const [lessons, setLessons] = useState(initialLessons);
  const [classFilter, setClassFilter] = useState(selectedClassId || "all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    classId: classes[0]?.id || "",
    title: "",
    description: "",
    content: "",
    status: "PUBLISHED",
  });

  const filteredLessons = lessons.filter((l) => {
    const matchesClass = classFilter === "all" || l.classId === classFilter;
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(search.toLowerCase())) ||
      l.class.name.toLowerCase().includes(search.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create lesson");

      const createdLessonWithClass = {
        ...data.lesson,
        class: classes.find((c) => c.id === formData.classId) || { name: "Class" },
        materials: [],
      };

      setLessons([createdLessonWithClass, ...lessons]);
      setShowModal(false);
      setFormData({
        classId: classes[0]?.id || "",
        title: "",
        description: "",
        content: "",
        status: "PUBLISHED",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (lessonId: string, currentStatus: string) => {
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLessons(
          lessons.map((l) => (l.id === lessonId ? { ...l, status: newStatus } : l))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
      if (res.ok) {
        setLessons(lessons.filter((l) => l.id !== lessonId));
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
            <BookOpen className="w-6 h-6 text-primary-600" />
            Lessons & Learning Materials
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize study units, upload lesson documents, and manage student learning modules.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Lesson</span>
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
            placeholder="Search lessons by title, topic, or keyword..."
            className="w-full bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="input-field w-full h-full bg-white text-xs font-semibold py-3 px-3 rounded-xl border border-slate-200"
          >
            <option value="all">All Classes ({classes.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lessons List */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No lessons found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {search || classFilter !== "all"
              ? "No lessons match your current filters."
              : "Start structuring your class syllabus by publishing your first lesson."}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs px-4 py-2 rounded-xl"
          >
            Create Lesson
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 transition-all shadow-xs"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-primary text-[10px] font-bold">
                      {lesson.class.name}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(lesson.id, lesson.status)}
                      className={`badge text-[10px] font-semibold cursor-pointer transition-colors ${
                        lesson.status === "PUBLISHED"
                          ? "badge-success hover:bg-emerald-200"
                          : "badge-neutral hover:bg-slate-200"
                      }`}
                      title="Click to toggle publish status"
                    >
                      {lesson.status === "PUBLISHED" ? "Published (Visible to Students)" : "Draft (Hidden)"}
                    </button>
                    {lesson.publishedAt && (
                      <span className="text-[11px] text-slate-400">
                        Published {new Date(lesson.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">{lesson.description}</p>
                  )}

                  {lesson.content && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 max-h-32 overflow-y-auto whitespace-pre-line border border-slate-100">
                      {lesson.content}
                    </div>
                  )}

                  {lesson.materials && lesson.materials.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Attached Files:
                      </span>
                      {lesson.materials.map((mat: any) => (
                        <a
                          key={mat.id}
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition-colors"
                        >
                          <Paperclip className="w-3 h-3 text-slate-500" />
                          <span>{mat.fileName}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-start">
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Lesson Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                Create New Lesson
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

            <form onSubmit={handleCreateLesson} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to Class *
                </label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="input-field w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Chapter 4: Quadratic Equations and Functions"
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of topics covered and learning outcomes"
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lesson Notes & Instructions
                </label>
                <textarea
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Type lecture notes, reading assignments, homework references, and instructions for students..."
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Publishing Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="PUBLISHED"
                      checked={formData.status === "PUBLISHED"}
                      onChange={() => setFormData({ ...formData, status: "PUBLISHED" })}
                    />
                    <span>Publish immediately (Notifies students)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="DRAFT"
                      checked={formData.status === "DRAFT"}
                      onChange={() => setFormData({ ...formData, status: "DRAFT" })}
                    />
                    <span>Save as Draft</span>
                  </label>
                </div>
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
                  {isSubmitting ? "Saving..." : "Create Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
