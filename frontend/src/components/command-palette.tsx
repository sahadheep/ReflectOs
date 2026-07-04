"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, BookOpen, BarChart3, Settings, LogOut, CheckSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <Command 
        className="w-full max-w-lg bg-bg-surface border border-border-subtle rounded-xl shadow-raised overflow-hidden text-text-primary outline-none"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <Command.Input 
          autoFocus
          placeholder="Type a command or search..." 
          className="w-full px-4 py-4 text-base bg-transparent border-b border-border-subtle outline-none placeholder:text-text-tertiary"
        />
        
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-text-secondary">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="px-2 py-1 text-xs font-medium text-text-tertiary">
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/dashboard"))}
              className="flex items-center gap-2 px-2 py-2 mt-1 text-sm rounded-md cursor-pointer hover:bg-bg-surface-hover aria-selected:bg-bg-surface-hover aria-selected:text-accent"
            >
              <LayoutDashboard size={16} /> Today's Dashboard
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/tasks"))}
              className="flex items-center gap-2 px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-bg-surface-hover aria-selected:bg-bg-surface-hover aria-selected:text-accent"
            >
              <CheckSquare size={16} /> Tasks
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/diary"))}
              className="flex items-center gap-2 px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-bg-surface-hover aria-selected:bg-bg-surface-hover aria-selected:text-accent"
            >
              <BookOpen size={16} /> Diary
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/analytics"))}
              className="flex items-center gap-2 px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-bg-surface-hover aria-selected:bg-bg-surface-hover aria-selected:text-accent"
            >
              <BarChart3 size={16} /> Analytics
            </Command.Item>
          </Command.Group>

          <Command.Separator className="h-px bg-border-subtle my-1 mx-2" />

          <Command.Group heading="Actions" className="px-2 py-1 text-xs font-medium text-text-tertiary">
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/settings"))}
              className="flex items-center gap-2 px-2 py-2 mt-1 text-sm rounded-md cursor-pointer hover:bg-bg-surface-hover aria-selected:bg-bg-surface-hover aria-selected:text-accent"
            >
              <Settings size={16} /> Settings
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => logout())}
              className="flex items-center gap-2 px-2 py-2 text-sm rounded-md cursor-pointer text-danger hover:bg-danger/10 aria-selected:bg-danger/10"
            >
              <LogOut size={16} /> Log Out
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
