"use client";

import { usePathname } from "next/navigation";
import { Search, Plus, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface TopbarProps {
  user?: { username: string; email: string } | null;
  onLogout: () => void;
}

export function Topbar({ user, onLogout }: TopbarProps) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  // Capitalize first letter of path
  const pageTitle = pathname === "/" 
    ? "Dashboard" 
    : pathname.split("/")[1].charAt(0).toUpperCase() + pathname.split("/")[1].slice(1);

  return (
    <header className="h-16 border-b border-border-subtle bg-bg-base/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 shrink-0 z-20 sticky top-0">
      
      {/* Page Title (Mobile mostly hides this or keeps it small) */}
      <h1 className="text-lg font-semibold text-text-primary hidden md:block">
        {pageTitle}
      </h1>
      
      {/* Search & Actions */}
      <div className="flex items-center gap-4 ml-auto md:ml-0">
        
        {/* Global Search Trigger */}
        <button 
          className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface border border-border-subtle rounded-md text-text-secondary hover:text-text-primary hover:border-border-default transition-colors"
        >
          <Search size={14} />
          <span className="text-sm hidden sm:inline-block">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-bg-surface-raised px-1.5 py-0.5 rounded text-text-tertiary">
            <span className="text-[12px]">⌘</span>K
          </kbd>
        </button>

        {/* Quick Add */}
        <button className="flex items-center justify-center w-8 h-8 rounded-md bg-accent text-bg-base hover:bg-accent-hover transition-colors shadow-sm">
          <Plus size={18} />
        </button>

        {/* Avatar / Profile */}
        <div className="relative ml-2">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full bg-bg-surface-raised border border-border-subtle flex items-center justify-center text-sm font-semibold text-text-primary hover:border-accent transition-colors focus-visible:outline-none focus-visible:shadow-focus"
          >
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-bg-surface border border-border-subtle rounded-md shadow-raised overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-border-subtle">
                  <p className="text-sm font-medium text-text-primary truncate">{user?.username}</p>
                  <p className="text-xs text-text-tertiary truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-sm transition-colors">
                    Profile Settings
                  </button>
                  <button 
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-sm transition-colors"
                  >
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
