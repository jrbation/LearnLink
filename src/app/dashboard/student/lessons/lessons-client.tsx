"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  School,
  FileText,
  Paperclip,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Props {
  initialLessons: any[];
  classes: any[];
  selectedClassId?: string;
}

export function StudentLessonsClient({ initialLessons, classes, selectedClassId }: Props) {
  const [lessons] = useState(initialLessons);
  const [classFilter, setClassFilter] = useState(selectedClassId || "all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(
    initialLessons[0]?.id || null
  );

  const filtered = lessons.filter((l) => {
    const matchesClass = classFilter === "all" || l.classId === classFilter;
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(search.toLowerCase())) ||
      l.class.name.toLowerCase().includes(search.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-600" />
          Lessons & Study Materials
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review curriculum topics, lecture notes, textbook references, and course reading materials.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons or topics..."
            className="w-full bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="input-field w-full h-full bg-white text-xs font-semibold py-3 px-3 rounded-xl border border-slate-200"
          >
            <option value="all">All Enrolled Classes ({classes.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lessons List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No lessons available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {search || classFilter !== "all"
              ? "No lessons match your search criteria."
              : "Your teachers haven't published any lessons yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((lesson) => {
            const isExpanded = expandedId === lesson.id;

            return (
              <div
                key={lesson.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                <div
                  onClick={() => toggleExpand(lesson.id)}
                  className="p-6 cursor-pointer hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-primary text-[10px] font-bold">
                        {lesson.class.name}
                      </span>
                      {lesson.publishedAt && (
                        <span className="text-[11px] text-slate-400">
                          {new Date(lesson.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">{lesson.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {lesson.materials.length > 0 && (
                      <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        {lesson.materials.length} {lesson.materials.length === 1 ? "File" : "Files"}
                      </span>
                    )}
                    <button className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/30">
                    {lesson.content && (
                      <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                        {lesson.content}
                      </div>
                    )}

                    {lesson.materials.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Downloadable Class Materials
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {lesson.materials.map((mat: any) => (
                            <a
                              key={mat.id}
                              href={mat.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold shadow-2xs transition-all"
                            >
                              <Paperclip className="w-4 h-4 text-primary-600" />
                              <span>{mat.fileName}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
