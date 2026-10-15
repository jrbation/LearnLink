"use client";

import { useState } from "react";
import Link from "next/link";
import {
  School,
  Plus,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Search,
  ExternalLink,
  Sparkles,
  User,
} from "lucide-react";

interface Props {
  initialEnrollments: any[];
}

export function StudentClassesClient({ initialEnrollments }: Props) {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [search, setSearch] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = enrollments.filter(
    (e) =>
      e.class.name.toLowerCase().includes(search.toLowerCase()) ||
      e.class.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.class.teacher.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: enrollmentCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join class");

      // Add new enrollment to list
      const newEnrollment = {
        id: data.enrollment.id,
        enrolledAt: data.enrollment.enrolledAt,
        status: data.enrollment.status,
        class: {
          ...data.enrollment.class,
          _count: { lessons: 0, assignments: 0, schedules: 0 },
        },
      };

      setEnrollments([newEnrollment, ...enrollments]);
      setShowJoinModal(false);
      setEnrollmentCode("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <School className="w-6 h-6 text-primary-600" />
            My Enrolled Classes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your course spaces, study materials, upcoming tests, and live classrooms.
          </p>
        </div>
        <button
          onClick={() => setShowJoinModal(true)}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Join Class with Code</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by class name, subject, or teacher..."
          className="w-full bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <span className="text-xs text-slate-400 whitespace-nowrap mr-2">
          {filtered.length} {filtered.length === 1 ? "Class" : "Classes"}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
          <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No classes found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {search
              ? "No classes match your search query."
              : "You are not enrolled in any classes yet. Ask your teacher for the enrollment code!"}
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-primary text-xs px-4 py-2 rounded-xl"
          >
            Enter Enrollment Code
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((enr) => (
            <div
              key={enr.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-primary-300 transition-all hover:shadow-md flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="badge badge-primary text-xs font-semibold">
                    {enr.class.subject}
                  </span>
                  {enr.class.section && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      Sec {enr.class.section}
                    </span>
                  )}
                </div>

                <Link
                  href={`/dashboard/student/classes/${enr.class.id}`}
                  className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1"
                >
                  {enr.class.name}
                </Link>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Instructor: <strong className="font-semibold text-slate-800">{enr.class.teacher.name}</strong></span>
                </div>

                {enr.class.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{enr.class.description}</p>
                )}

                {/* Quick metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  <div>
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {enr.class._count?.lessons || 0}
                    </span>
                    <span className="block text-[9px] text-slate-400">Lessons</span>
                  </div>
                  <div>
                    <ClipboardCheck className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {enr.class._count?.assignments || 0}
                    </span>
                    <span className="block text-[9px] text-slate-400">Tasks</span>
                  </div>
                  <div>
                    <Calendar className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {enr.class._count?.schedules || 0}
                    </span>
                    <span className="block text-[9px] text-slate-400">Live</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/dashboard/student/classes/${enr.class.id}`}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  Enter Classroom
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <span className="text-[10px] text-slate-400">
                  Joined {new Date(enr.enrolledAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                Join a Class
              </h2>
              <button
                onClick={() => setShowJoinModal(false)}
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

            <form onSubmit={handleJoinClass} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enrollment Code *
                </label>
                <input
                  type="text"
                  required
                  value={enrollmentCode}
                  onChange={(e) => setEnrollmentCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MATH10-XXXX"
                  className="input-field w-full text-base font-mono tracking-wider py-2.5 px-3 rounded-xl border border-slate-200 uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Ask your teacher for the 6–10 character code assigned to your course.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="btn-secondary px-4 py-2 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !enrollmentCode.trim()}
                  className="btn-primary px-5 py-2 text-xs font-medium rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Joining..." : "Join Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
