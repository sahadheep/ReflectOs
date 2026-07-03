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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  user?: { username: string; email: string };
  onLogout: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Diary", href: "/diary", icon: BookOpen },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative z-50 flex flex-col rounded-2xl glass-panel transition-all duration-300 m-6 mr-0 h-[calc(100vh-3rem)] shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border/20">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                ReflectOS
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <motion.div
              key={item.name}
              whileHover={{ x: isCollapsed ? 0 : 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link
                href={item.href}
                className="relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg border-l-2 border-primary shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]"
                    transition={{ type: "spring", bounce: 0.2 }}
                  />
                )}
                <Icon
                  size={20}
                  className={`relative transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`relative text-sm font-medium transition-colors ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Notifications */}
      <div className="px-3 py-4 border-t border-border/20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-full flex items-center justify-center p-3 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Bell
            size={20}
            className="text-muted-foreground hover:text-foreground"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary/80"
          />
        </motion.button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border/20">
        <motion.div
          onClick={() => setShowUserMenu(!showUserMenu)}
          whileHover={{ scale: 1.02 }}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors relative cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/60 to-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30 group-hover:shadow-glow transition-all">
            <span className="text-sm font-bold text-white">
              {user?.username?.substring(0, 1)?.toUpperCase() || "U"}
            </span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0"
              >
                <div className="text-sm font-semibold text-foreground truncate">
                  {user?.username}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User menu dropdown */}
          <AnimatePresence>
            {showUserMenu && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border/30 rounded-xl p-2 space-y-1"
              >
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                >
                  <User size={16} /> Profile
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {isCollapsed && (
          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-full flex items-center justify-center p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors mt-2"
          >
            <LogOut size={18} />
          </motion.button>
        )}
      </div>
    </motion.aside>
  );
}
