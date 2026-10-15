"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardShellProps {
  role?: "TEACHER" | "STUDENT" | "PARENT" | string;
  user: {
    id?: string;
    name: string;
    email: string;
    role: "TEACHER" | "STUDENT" | "PARENT";
    avatar?: string | null;
  };
  children: React.ReactNode;
  activeChildName?: string;
}

export function DashboardShell({ user, children, activeChildName }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <Sidebar
        role={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          user={user}
          onOpenSidebar={() => setSidebarOpen(true)}
          notifications={notifications}
          unreadCount={unreadCount}
          activeChildName={activeChildName}
          onRefreshNotifications={fetchNotifications}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
