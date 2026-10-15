"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Calendar,
  Award,
  Megaphone,
  ClipboardCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface Props {
  initialNotifications: any[];
}

export function NotificationsClient({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isMarking, setIsMarking] = useState(false);

  const filtered = notifications.filter(
    (n) => filter === "all" || !n.isRead
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    setIsMarking(true);
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });
      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMarking(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "GRADE_RELEASED":
        return <Award className="w-5 h-5 text-emerald-600" />;
      case "ASSIGNMENT_DUE":
        return <ClipboardCheck className="w-5 h-5 text-primary-600" />;
      case "SCHEDULE_CHANGE":
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case "ANNOUNCEMENT":
        return <Megaphone className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600" />
            Notifications Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time alerts for grades, assignments, attendance flags, and class broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarking}
              className="btn-secondary text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            filter === "all"
              ? "bg-primary-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            filter === "unread"
              ? "bg-primary-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 p-8">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No notifications</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {filter === "unread"
              ? "You have read all of your notifications."
              : "You have no notifications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 shadow-xs ${
                item.isRead
                  ? "bg-white border-slate-200"
                  : "bg-primary-50/30 border-primary-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
                  {getNotificationIcon(item.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {item.link && (
                <Link
                  href={item.link}
                  className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 font-semibold text-slate-700"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
