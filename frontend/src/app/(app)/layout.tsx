"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { CommandPalette } from "@/components/command-palette";

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
      <div className="flex h-screen items-center justify-center bg-bg-base">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Loading workspace...</p>
        </div>
      </div>
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
        <main className="flex-1 overflow-y-auto relative z-0">
          <div className="max-w-[1100px] mx-auto w-full p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
