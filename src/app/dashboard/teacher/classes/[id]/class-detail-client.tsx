"use client";

import { useState } from "react";
import Link from "next/link";
import {
  School,
  Users,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Megaphone,
  Copy,
  Check,
  Plus,
  ArrowLeft,
  Clock,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface Props {
  initialClass: any;
}

export function TeacherClassDetailClient({ initialClass }: Props) {
  const [activeTab, setActiveTab] = useState<"roster" | "lessons" | "assignments" | "schedules" | "announcements">("roster");
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(initialClass.enrollmentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const tabs = [
    { id: "roster", label: `Students (${initialClass.enrollments.length})`, icon: Users },
    { id: "lessons", label: `Lessons (${initialClass.lessons.length})`, icon: BookOpen },
    { id: "assignments", label: `Quizzes & Tasks (${initialClass.assignments.length})`, icon: ClipboardCheck },
    { id: "schedules", label: `Schedule (${initialClass.schedules.length})`, icon: Calendar },
    { id: "announcements", label: `Announcements (${initialClass.announcements.length})`, icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      {/* Back button & Header banner */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/teacher/classes"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all classes
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-primary text-xs font-semibold">
              {initialClass.subject}
            </span>
            {initialClass.gradeLevel && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                {initialClass.gradeLevel}
              </span>
            )}
            {initialClass.section && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                Section {initialClass.section}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {initialClass.name}
          </h1>
          {initialClass.description && (
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">{initialClass.description}</p>
          )}
        </div>

        {/* Enrollment Code Box */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Student Enrollment Code
            </span>
            <span className="text-lg font-mono font-bold text-primary-700 tracking-wider">
              {initialClass.enrollmentCode}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-2 bg-white rounded-lg border border-slate-200 hover:border-primary-400 text-slate-600 hover:text-primary-600 shadow-xs transition-all"
            title="Copy enrollment code"
          >
            {copiedCode ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? "border-primary-600 text-primary-600 bg-primary-50/30"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content: Roster */}
      {activeTab === "roster" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enrolled Students</h3>
              <p className="text-xs text-slate-500">
                Students who joined using code <span className="font-mono font-bold text-primary-600">{initialClass.enrollmentCode}</span>
              </p>
            </div>
          </div>

          {initialClass.enrollments.length === 0 ? (
            <div className="text-center py-12 p-6">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No students enrolled yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                Share the code <strong className="font-mono text-primary-600">{initialClass.enrollmentCode}</strong> with your students to have them appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {initialClass.enrollments.map((enr: any) => (
                <div key={enr.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                      {enr.student.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{enr.student.name}</h4>
                      <p className="text-[11px] text-slate-400">{enr.student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-success text-[10px] font-semibold">
                      {enr.status}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Enrolled {new Date(enr.enrolledAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Lessons */}
      {activeTab === "lessons" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Curriculum & Lessons</h3>
            <Link
              href={`/dashboard/teacher/lessons?classId=${initialClass.id}`}
              className="btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Lesson</span>
            </Link>
          </div>

          {initialClass.lessons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 p-6">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No lessons created yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Publish course materials, lecture notes, and instructional content.
              </p>
              <Link
                href={`/dashboard/teacher/lessons?classId=${initialClass.id}`}
                className="btn-primary text-xs px-3 py-1.5 rounded-lg"
              >
                Create First Lesson
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialClass.lessons.map((lesson: any, idx: number) => (
                <div key={lesson.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Lesson {idx + 1}
                      </span>
                      <span className={`badge text-[10px] ${lesson.status === "PUBLISHED" ? "badge-success" : "badge-neutral"}`}>
                        {lesson.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{lesson.title}</h4>
                    {lesson.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lesson.description}</p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {lesson.materials.length} Materials
                    </span>
                    <Link
                      href={`/dashboard/teacher/lessons?classId=${initialClass.id}`}
                      className="text-primary-600 font-semibold hover:underline"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Assignments */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Assessments & Tasks</h3>
            <Link
              href={`/dashboard/teacher/assignments?classId=${initialClass.id}`}
              className="btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task / Quiz</span>
            </Link>
          </div>

          {initialClass.assignments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 p-6">
              <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No tasks created yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Set up homework, quizzes with auto-grading, and projects for your students.
              </p>
              <Link
                href={`/dashboard/teacher/assignments?classId=${initialClass.id}`}
                className="btn-primary text-xs px-3 py-1.5 rounded-lg"
              >
                Create Assessment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {initialClass.assignments.map((asg: any) => (
                <div key={asg.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-[10px] font-semibold ${asg.type === "QUIZ" ? "badge-warning" : "badge-primary"}`}>
                        {asg.type}
                      </span>
                      <span className={`badge text-[10px] ${asg.status === "PUBLISHED" ? "badge-success" : "badge-neutral"}`}>
                        {asg.status}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {asg.totalPoints} pts
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{asg.title}</h4>
                    {asg.dueDate && (
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Due: {new Date(asg.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800">
                        {asg._count?.submissions || 0}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Submissions</span>
                    </div>
                    <Link
                      href={`/dashboard/teacher/assignments/${asg.id}/grade`}
                      className="btn-secondary text-xs px-3 py-1.5 rounded-lg font-semibold"
                    >
                      Review & Grade
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Schedules */}
      {activeTab === "schedules" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Live Video Classes & Sessions</h3>
            <Link
              href={`/dashboard/teacher/schedule?classId=${initialClass.id}`}
              className="btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Session</span>
            </Link>
          </div>

          {initialClass.schedules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 p-6">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No scheduled sessions</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Plan live lessons, office hours, and video meetings.
              </p>
              <Link
                href={`/dashboard/teacher/schedule?classId=${initialClass.id}`}
                className="btn-primary text-xs px-3 py-1.5 rounded-lg"
              >
                Schedule Class
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {initialClass.schedules.map((sch: any) => (
                <div key={sch.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{sch.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        {new Date(sch.startTime).toLocaleString()} - {new Date(sch.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {sch.meetingLink ? (
                    <a
                      href={sch.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Meeting
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">No link set</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Announcements */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Class Notices & Announcements</h3>
            <Link
              href={`/dashboard/teacher/announcements?classId=${initialClass.id}`}
              className="btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Announcement</span>
            </Link>
          </div>

          {initialClass.announcements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 p-6">
              <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No announcements yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Share updates and reminders with students and parents.
              </p>
              <Link
                href={`/dashboard/teacher/announcements?classId=${initialClass.id}`}
                className="btn-primary text-xs px-3 py-1.5 rounded-lg"
              >
                Post First Notice
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {initialClass.announcements.map((anc: any) => (
                <div key={anc.id} className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge badge-primary text-[10px]">
                      Audience: {anc.targetAudience}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(anc.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{anc.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">{anc.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
