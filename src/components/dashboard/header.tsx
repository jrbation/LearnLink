"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Check,
  ExternalLink,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { formatTime, getInitials } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string | Date;
}

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: "TEACHER" | "STUDENT" | "PARENT";
    avatar?: string | null;
  };
  onOpenSidebar: () => void;
  notifications?: NotificationItem[];
  unreadCount?: number;
  activeChildName?: string;
  onRefreshNotifications?: () => void;
}

export function Header({
  user,
  onOpenSidebar,
  notifications = [],
  unreadCount = 0,
  activeChildName,
  onRefreshNotifications,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      if (onRefreshNotifications) onRefreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {activeChildName && user.role === "PARENT" && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800">
            <span className="font-semibold">Viewing Student:</span>
            <span>{activeChildName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="dropdown-menu w-80 sm:w-96 p-2 right-0">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <div className="font-semibold text-xs text-slate-800">Notifications</div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <Link
                      key={n.id}
                      href={n.link || "/dashboard/notifications"}
                      onClick={() => setShowNotifMenu(false)}
                      className={`block p-3 rounded-lg text-xs transition-colors ${
                        !n.isRead ? "bg-primary-50/50 hover:bg-primary-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-medium text-slate-800 flex items-center justify-between mb-1">
                        <span>{n.title}</span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                    </Link>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                >
                  View all notifications
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-accent text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {getInitials(user.name)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">{user.role.toLowerCase()}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="dropdown-menu w-56 right-0 py-1">
              <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                <div className="text-xs font-semibold text-slate-800">{user.name}</div>
                <div className="text-[10px] text-slate-400">{user.email}</div>
              </div>

              <Link
                href="/dashboard/profile"
                onClick={() => setShowUserMenu(false)}
                className="dropdown-item text-xs"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile Settings
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="dropdown-item text-xs text-red-600 hover:bg-red-50 w-full text-left"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
