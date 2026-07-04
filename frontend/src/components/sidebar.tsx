"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/api";
import {
  Inbox,
  Star,
  CalendarDays,
  Layers,
  Box,
  CheckSquare,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  FolderOpen,
  BookOpen,
  BarChart3,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fetch all tasks to extract unique categories (Projects/Lists)
  const { data: tasks } = useQuery({
    queryKey: ["tasks", "history"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    enabled: !!user,
  });

  const categories = tasks
    ? Array.from(new Set(tasks.map((t: any) => t.category).filter((c: any) => c && c !== "General")))
    : [];

  const topNavItems = [
    { name: "Inbox", href: "/tasks/inbox", icon: Inbox, color: "text-blue-500" },
    { name: "Today", href: "/tasks/today", icon: Star, color: "text-yellow-400" },
    { name: "Upcoming", href: "/tasks/upcoming", icon: CalendarDays, color: "text-pink-500" },
    { name: "Anytime", href: "/tasks/anytime", icon: Layers, color: "text-green-500" },
    { name: "Someday", href: "/tasks/someday", icon: Box, color: "text-yellow-600" },
    { name: "Logbook", href: "/tasks/logbook", icon: CheckSquare, color: "text-emerald-600" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-bg-base border-r border-border-subtle transition-all duration-300 ease-in-out shrink-0 z-30 ${
          isCollapsed ? "w-[64px]" : "w-[240px]"
        }`}
      >
        {/* Header / Search Placeholder */}
        <div className="h-16 flex items-center px-4 shrink-0 border-b border-border-subtle">
          <div className={`flex items-center w-full transition-all duration-300 ${isCollapsed ? "justify-center" : "gap-2"}`}>
            {isCollapsed ? (
              <div className="w-8 h-8 rounded shrink-0 bg-bg-surface-raised flex items-center justify-center text-text-secondary cursor-pointer hover:bg-bg-surface-hover">
                <Search size={16} />
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-2 bg-bg-surface-raised px-3 py-1.5 rounded-md text-text-tertiary cursor-text border border-border-default hover:border-accent/50 transition-colors">
                <Search size={16} />
                <span className="text-sm">Quick Find</span>
                <span className="ml-auto text-xs bg-bg-base px-1.5 py-0.5 rounded border border-border-subtle">⌘K</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto custom-scrollbar">
          {topNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative group outline-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBorder"
                    className="absolute left-0 top-1 bottom-1 w-[2px] bg-accent rounded-r-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                <div
                  className={`flex items-center gap-3 px-2 py-1.5 mx-2 rounded-md transition-colors duration-150 ${
                    isActive 
                      ? "bg-bg-surface-raised text-text-primary" 
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover"
                  } focus-visible:shadow-focus`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon size={18} className={`shrink-0 ${item.color}`} strokeWidth={isActive ? 2.5 : 2} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {!isCollapsed && categories.length > 0 && (
            <div className="mt-6 mb-2 px-4 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Lists</h3>
            </div>
          )}

          {categories.map((category: any) => {
            const href = `/tasks/list/${encodeURIComponent(category)}`;
            const isActive = pathname === href;
            return (
              <Link key={category} href={href} className="relative group outline-none">
                {isActive && (
                  <motion.div
                    layoutId="activeNavBorder"
                    className="absolute left-0 top-1 bottom-1 w-[2px] bg-accent rounded-r-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div
                  className={`flex items-center gap-3 px-2 py-1.5 mx-2 rounded-md transition-colors duration-150 ${
                    isActive 
                      ? "bg-bg-surface-raised text-text-primary" 
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover"
                  } focus-visible:shadow-focus`}
                  title={isCollapsed ? category : undefined}
                >
                  <FolderOpen size={16} className="shrink-0 text-text-tertiary" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {category}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {!isCollapsed && (
            <div className="mt-6 mb-2 px-4">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">ReflectOS</h3>
            </div>
          )}

          {[
            { name: "Diary", href: "/diary", icon: BookOpen, color: "text-purple-400" },
            { name: "Analytics", href: "/analytics", icon: BarChart3, color: "text-orange-400" },
            { name: "Settings", href: "/settings", icon: Settings, color: "text-text-tertiary" },
          ].map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className="relative group outline-none">
                {isActive && (
                  <motion.div
                    layoutId="activeNavBorder"
                    className="absolute left-0 top-1 bottom-1 w-[2px] bg-accent rounded-r-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div
                  className={`flex items-center gap-3 px-2 py-1.5 mx-2 rounded-md transition-colors duration-150 ${
                    isActive 
                      ? "bg-bg-surface-raised text-text-primary" 
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover"
                  } focus-visible:shadow-focus`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon size={18} className={`shrink-0 ${item.color}`} strokeWidth={isActive ? 2.5 : 2} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Toggle */}
        <div className="p-2 shrink-0 border-t border-border-subtle">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover rounded-md transition-colors focus-visible:outline-none focus-visible:shadow-focus"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-surface border-t border-border-subtle flex items-center justify-around px-2 pb-safe z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
        {topNavItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              <Icon size={20} className={isActive ? item.color : "text-text-tertiary"} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
