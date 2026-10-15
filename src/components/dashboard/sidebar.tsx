"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import {
  GraduationCap,
  LayoutDashboard,
  School,
  BookOpen,
  ClipboardCheck,
  UserCheck,
  Calendar,
  Megaphone,
  BarChart3,
  Bell,
  User,
  LogOut,
  X,
  MessageSquare,
  AlertCircle,
  Award,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  role: "TEACHER" | "STUDENT" | "PARENT";
  isOpen: boolean;
  onClose: () => void;
  unreadCount?: number;
}

export function Sidebar({ role, isOpen, onClose, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const teacherNav = [
    { href: "/dashboard/teacher", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/teacher/classes", label: "My Classes", icon: School },
    { href: "/dashboard/teacher/lessons", label: "Lessons & Materials", icon: BookOpen },
    { href: "/dashboard/teacher/assignments", label: "Quizzes & Tasks", icon: ClipboardCheck },
    { href: "/dashboard/teacher/attendance", label: "Attendance", icon: UserCheck },
    { href: "/dashboard/teacher/schedule", label: "Class Schedule", icon: Calendar },
    { href: "/dashboard/teacher/announcements", label: "Announcements", icon: Megaphone },
    { href: "/dashboard/teacher/progress", label: "Student Progress", icon: BarChart3 },
  ];

  const studentNav = [
    { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/student/classes", label: "My Classes", icon: School },
    { href: "/dashboard/student/lessons", label: "Lessons & Study", icon: BookOpen },
    { href: "/dashboard/student/assignments", label: "Quizzes & Tasks", icon: ClipboardCheck },
    { href: "/dashboard/student/grades", label: "Scores & Progress", icon: Award },
    { href: "/dashboard/student/schedule", label: "Remote Classes", icon: Calendar },
    { href: "/dashboard/student/announcements", label: "Announcements", icon: Megaphone },
  ];

  const parentNav = [
    { href: "/dashboard/parent", label: "Child Overview", icon: LayoutDashboard },
    { href: "/dashboard/parent/announcements", label: "Announcement Board", icon: Megaphone },
    { href: "/dashboard/parent/schedule", label: "Class Schedule", icon: Calendar },
    { href: "/dashboard/parent/progress", label: "Progress Reports", icon: BarChart3 },
    { href: "/dashboard/parent/alerts", label: "Learning Alerts", icon: AlertCircle },
    { href: "/dashboard/parent/messages", label: "Teacher Updates", icon: MessageSquare },
  ];

  const navItems =
    role === "TEACHER"
      ? teacherNav
      : role === "STUDENT"
      ? studentNav
      : parentNav;

  const roleLabel =
    role === "TEACHER" ? "Teacher Portal" : role === "STUDENT" ? "Student Portal" : "Parent Portal";

  const roleBadgeColor =
    role === "TEACHER"
      ? "badge-primary"
      : role === "STUDENT"
      ? "badge-success"
      : "badge-warning";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <BrandLogo size="sm" href="/" />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Indicator Banner */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {roleLabel}
          </span>
          <span className={`badge ${roleBadgeColor} text-[10px]`}>
            {role}
          </span>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary-50 text-primary-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-primary-600" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Utility Navigation */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <Link
            href="/dashboard/notifications"
            onClick={onClose}
            className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
              pathname === "/dashboard/notifications"
                ? "bg-primary-50 text-primary-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
              pathname === "/dashboard/profile"
                ? "bg-primary-50 text-primary-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>Profile & Settings</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
