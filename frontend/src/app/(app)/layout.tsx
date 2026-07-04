"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { CommandPalette } from "@/components/command-palette";
import { TimerDock } from "@/components/timer-dock";
import { AnimatePresence, motion } from "framer-motion";
import { TRANSITION } from "@/lib/motion";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      ) {
        if (e.key === "Escape") {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case "n":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            // TODO: Open quick-add slide-over
          }
          break;
        case "k":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            // TODO: Open command palette
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  if (loading || !isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            key="app-loading-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITION}
            className="flex h-screen bg-bg-base overflow-hidden"
          >
            {/* Skeleton Sidebar */}
            <div className="w-[240px] border-r border-border-subtle bg-bg-surface-raised flex flex-col p-4 gap-4 hidden md:flex">
              <div className="h-6 w-32 bg-border-subtle rounded animate-pulse" />
              <div className="space-y-2 mt-4">
                <div className="h-8 bg-border-subtle rounded animate-pulse opacity-50" />
                <div className="h-8 bg-border-subtle rounded animate-pulse opacity-30" />
                <div className="h-8 bg-border-subtle rounded animate-pulse opacity-20" />
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="h-14 border-b border-border-subtle flex items-center px-4">
                <div className="h-8 w-48 bg-border-subtle rounded animate-pulse" />
              </div>
              <div className="p-8 space-y-4">
                <div className="h-10 w-1/3 bg-border-subtle rounded animate-pulse" />
                <div className="h-32 bg-border-subtle rounded-xl animate-pulse opacity-50" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      {/* Sidebar (Desktop) / Bottom Tabs (Mobile) */}
      <Sidebar />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (Search, Avatar) */}
        <Topbar user={user} onLogout={logout} />
        
        {/* Scrollable page content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </div>
          <TimerDock />
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
