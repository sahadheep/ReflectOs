"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Today", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: Calendar }, 
    { name: "Diary", href: "/diary", icon: BookOpen },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-bg-base border-r border-border-subtle transition-all duration-300 ease-in-out shrink-0 z-30 ${
          isCollapsed ? "w-[64px]" : "w-[240px]"
        }`}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center px-4 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden w-full">
            <div className="w-8 h-8 rounded shrink-0 bg-accent text-bg-base flex items-center justify-center font-bold text-lg leading-none">
              R
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-text-primary tracking-tight whitespace-nowrap"
              >
                ReflectOS
              </motion.span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative group outline-none"
              >
                {/* Active Indicator Border */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavBorder"
                    className="absolute left-0 top-1 bottom-1 w-[2px] bg-accent rounded-r-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                <div
                  className={`flex items-center gap-3 px-2 py-2 mx-2 rounded-md transition-colors duration-150 ${
                    isActive 
                      ? "text-accent" 
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover"
                  } focus-visible:shadow-focus`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon size={18} className="shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
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
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-accent" : "text-text-secondary"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
