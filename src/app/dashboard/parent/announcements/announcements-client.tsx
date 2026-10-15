"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Pin,
  Users,
  User,
  MessageSquare,
  Search,
  ExternalLink,
} from "lucide-react";

interface Props {
  childrenList: any[];
  initialAnnouncements: any[];
}

export function ParentAnnouncementsClient({ childrenList, initialAnnouncements }: Props) {
  const [selectedChildId, setSelectedChildId] = useState("all");
  const [search, setSearch] = useState("");

  const selectedChild = childrenList.find((c) => c.id === selectedChildId);

  const filtered = initialAnnouncements.filter((anc) => {
    // Child filter
    if (selectedChildId !== "all" && selectedChild) {
      if (!selectedChild.classIds.includes(anc.classId)) return false;
    }

    // Search filter
    const matchesSearch =
      anc.title.toLowerCase().includes(search.toLowerCase()) ||
      anc.message.toLowerCase().includes(search.toLowerCase()) ||
      anc.class.name.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary-600" />
            Parent Announcement Board
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay informed on school events, teacher memos, homework guidelines, and parent-teacher updates.
          </p>
        </div>

        {childrenList.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <Users className="w-4 h-4 text-slate-400 ml-1" />
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 border-none focus:outline-none"
            >
              <option value="all">All Linked Children</option>
              {childrenList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}&apos;s Classes
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search announcements by subject or content..."
          className="w-full bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No notices found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            There are currently no announcements posted for this selection.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs ${
                item.isPinned ? "border-amber-300 bg-amber-50/20" : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {item.isPinned && (
                    <span className="badge badge-warning text-[10px] font-bold flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      Pinned Announcement
                    </span>
                  )}
                  {item.class && (
                    <span className="badge badge-primary text-[10px] font-bold">
                      {item.class.name}
                    </span>
                  )}
                  <span className="badge badge-neutral text-[10px]">
                    Audience: {item.targetAudience === "all" ? "Parents & Students" : "Parents Only"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Posted {new Date(item.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>

              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 mb-3">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Teacher: <strong className="font-semibold text-slate-700">{item.teacher.name}</strong></span>
              </div>

              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {item.message}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                <Link
                  href="/dashboard/parent/messages"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Contact Teacher
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
