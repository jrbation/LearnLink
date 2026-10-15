"use client";

import { useState } from "react";
import Link from "next/link";
import {
  School,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Megaphone,
  ArrowLeft,
  Clock,
  Video,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Award,
  ExternalLink,
  Paperclip,
} from "lucide-react";

interface Props {
  classData: any;
  studentId: string;
}

export function StudentClassDetailClient({ classData, studentId }: Props) {
  const [activeTab, setActiveTab] = useState<"lessons" | "assignments" | "schedules" | "announcements">("lessons");

  const tabs = [
    { id: "lessons", label: `Lessons (${classData.lessons.length})`, icon: BookOpen },
    { id: "assignments", label: `Quizzes & Tasks (${classData.assignments.length})`, icon: ClipboardCheck },
    { id: "schedules", label: `Live Classes (${classData.schedules.length})`, icon: Calendar },
    { id: "announcements", label: `Announcements (${classData.announcements.length})`, icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/student/classes"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all classes
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-primary text-xs font-semibold">
              {classData.subject}
            </span>
            {classData.section && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                Section {classData.section}
              </span>
            )}
            {classData.gradeLevel && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                {classData.gradeLevel}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {classData.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Instructor: <strong className="text-slate-800">{classData.teacher.name}</strong> ({classData.teacher.email})
          </p>
          {classData.description && (
            <p className="text-xs text-slate-600 mt-2 max-w-2xl">{classData.description}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
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

      {/* Lessons Tab */}
      {activeTab === "lessons" && (
        <div className="space-y-4">
          {classData.lessons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 p-6">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No lessons published yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Your instructor will post lecture notes and study guides here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {classData.lessons.map((lesson: any, idx: number) => (
                <div key={lesson.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Module {idx + 1}
                    </span>
                    {lesson.publishedAt && (
                      <span className="text-[11px] text-slate-400">
                        {new Date(lesson.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-xs text-slate-600 mt-1">{lesson.description}</p>
                  )}

                  {lesson.content && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl text-xs text-slate-700 whitespace-pre-line border border-slate-100 leading-relaxed">
                      {lesson.content}
                    </div>
                  )}

                  {lesson.materials.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Files & Attachments:
                      </span>
                      {lesson.materials.map((mat: any) => (
                        <a
                          key={mat.id}
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs text-slate-700 font-medium transition-colors"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                          <span>{mat.fileName}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          {classData.assignments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 p-6">
              <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No active tasks or quizzes</p>
              <p className="text-[11px] text-slate-400 mt-1">
                You are all caught up with your homework for this class.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              {classData.assignments.map((asg: any) => {
                const sub = asg.submissions[0];
                const isSubmitted = !!sub && sub.status !== "DRAFT";
                const isGraded = sub?.status === "GRADED";
                const isOverdue = asg.dueDate && new Date() > new Date(asg.dueDate) && !isSubmitted;

                return (
                  <div key={asg.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`badge text-[10px] font-bold ${asg.type === "QUIZ" ? "badge-warning" : "badge-secondary"}`}>
                          {asg.type}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {asg.totalPoints} pts
                        </span>
                        {isGraded ? (
                          <span className="badge badge-success text-[10px] font-bold">
                            Score: {sub.grade?.score} / {asg.totalPoints} pts ({Math.round(sub.grade?.percentage)}%)
                          </span>
                        ) : isSubmitted ? (
                          <span className="badge badge-primary text-[10px] font-bold">
                            Submitted - Awaiting Grade
                          </span>
                        ) : isOverdue ? (
                          <span className="badge badge-danger text-[10px] font-bold">
                            Overdue
                          </span>
                        ) : (
                          <span className="badge badge-neutral text-[10px]">
                            Pending
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{asg.title}</h4>
                      {asg.dueDate && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Due: {new Date(asg.dueDate).toLocaleDateString()} at {new Date(asg.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/student/assignments/${asg.id}`}
                      className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
                        isGraded
                          ? "btn-secondary text-primary-700"
                          : isSubmitted
                          ? "btn-secondary text-slate-700"
                          : "btn-primary"
                      }`}
                    >
                      {isGraded ? (
                        <>
                          <Award className="w-3.5 h-3.5" />
                          <span>View Results</span>
                        </>
                      ) : isSubmitted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View Submission</span>
                        </>
                      ) : (
                        <>
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>Start Assessment</span>
                        </>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === "schedules" && (
        <div className="space-y-4">
          {classData.schedules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 p-6">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No scheduled sessions</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Upcoming video lectures will be scheduled by your teacher.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {classData.schedules.map((sch: any) => (
                <div key={sch.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{sch.title}</h4>
                      <p className="text-xs text-slate-500">
                        {new Date(sch.startTime).toLocaleString()} - {new Date(sch.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {sch.meetingLink ? (
                    <a
                      href={sch.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Video Class
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Meeting link pending</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          {classData.announcements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 p-6">
              <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No notices posted</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Announcements from your teacher will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {classData.announcements.map((anc: any) => (
                <div key={anc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-slate-400">
                      {new Date(anc.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{anc.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                    {anc.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
