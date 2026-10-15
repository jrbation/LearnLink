"use client";

import { useState } from "react";
import Link from "next/link";
import {
  School,
  Plus,
  Users,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Copy,
  Check,
  MoreVertical,
  Search,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface TeacherClassesClientProps {
  initialClasses: any[];
}

export function TeacherClassesClient({ initialClasses }: TeacherClassesClientProps) {
  const [classes, setClasses] = useState(initialClasses);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    gradeLevel: "",
    section: "",
    description: "",
  });

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      (c.section && c.section.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create class");

      setClasses([
        {
          ...data.class,
          _count: { enrollments: 0, lessons: 0, assignments: 0, schedules: 0 },
          enrollments: [],
        },
        ...classes,
      ]);
      setShowCreateModal(false);
      setFormData({ name: "", subject: "", gradeLevel: "", section: "", description: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <School className="w-6 h-6 text-primary-600" />
            My Classes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your course spaces, invite students with unique enrollment codes, and track activity.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Class</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by class name, subject, or section..."
          className="w-full bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <span className="text-xs text-slate-400 whitespace-nowrap mr-2">
          {filteredClasses.length} {filteredClasses.length === 1 ? "Class" : "Classes"}
        </span>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <School className="w-7 h-7 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No classes found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {search ? "No classes match your search query." : "You haven't created any classes yet. Create your first class to get started!"}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-4 py-2 rounded-xl text-sm font-medium"
          >
            Create Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-primary-300 transition-all hover:shadow-md flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="badge badge-primary text-xs font-semibold">
                    {cls.subject}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {cls.gradeLevel && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {cls.gradeLevel}
                      </span>
                    )}
                    {cls.section && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        Sec {cls.section}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/dashboard/teacher/classes/${cls.id}`}
                  className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1"
                >
                  {cls.name}
                </Link>
                {cls.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cls.description}</p>
                )}

                {/* Enrollment Code Pill */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                      Student Code
                    </span>
                    <span className="text-xs font-mono font-bold text-primary-700 tracking-wider">
                      {cls.enrollmentCode}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(cls.enrollmentCode)}
                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                    title="Copy code for students"
                  >
                    {copiedCode === cls.enrollmentCode ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  <div>
                    <Users className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {cls._count?.enrollments || 0}
                    </span>
                    <span className="block text-[9px] text-slate-400">Students</span>
                  </div>
                  <div>
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {cls._count?.lessons || 0}
                    </span>
                    <span className="block text-[9px] text-slate-400">Lessons</span>
                  </div>
                  <div>
                    <ClipboardCheck className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {cls._count?.assignments || 0}
                    </span>
                    <span className="block text-[9px] text-slate-400">Tasks</span>
                  </div>
                  <div>
                    <Calendar className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {cls._count?.schedules || 0}
                    </span>
                    <span className="block text-[9px] text-slate-400">Live</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/dashboard/teacher/classes/${cls.id}`}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  Open Class Space
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/teacher/lessons?classId=${cls.id}`}
                    className="text-[11px] text-slate-500 hover:text-slate-900"
                  >
                    + Lesson
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link
                    href={`/dashboard/teacher/assignments?classId=${cls.id}`}
                    className="text-[11px] text-slate-500 hover:text-slate-900"
                  >
                    + Quiz
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                Create New Class
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
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

            <form onSubmit={handleCreateClass} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Advanced Mathematics 101"
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grade Level
                  </label>
                  <input
                    type="text"
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    placeholder="e.g. Grade 10"
                    className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Section / Cohort
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="e.g. Section A - Morning"
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of learning goals or syllabus..."
                  className="input-field w-full text-sm py-2 px-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary px-4 py-2 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-5 py-2 text-xs font-medium rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Creating..." : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
