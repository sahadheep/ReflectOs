"use client";

import { useState, useEffect } from "react";
import { parseISO } from "date-fns";
import { Timer, Square } from "lucide-react";

interface TaskTimerProps {
  task: {
    completed: boolean;
    createdAt?: string;
    completedAt?: string;
  };
  onStop?: () => void;
}

export function TaskTimer({ task, onStop }: TaskTimerProps) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!task.createdAt) return;

    const start = parseISO(task.createdAt);

    if (task.completed) {
      const end = task.completedAt ? parseISO(task.completedAt) : new Date();
      const diffMs = end.getTime() - start.getTime();
      setElapsed(formatDurationMs(diffMs));
      return;
    }

    const updateTimer = () => {
      const diffMs = Date.now() - start.getTime();
      setElapsed(formatDurationMs(diffMs));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [task.createdAt, task.completed, task.completedAt]);

  if (!task.createdAt) return null;

  return (
    <div className="inline-flex items-center gap-1">
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono transition-all select-none ${
          task.completed
            ? "bg-bg-surface text-white/50 border border-border-subtle"
            : "bg-accent/10 text-white border border-accent/20 shadow-[0_0_8px_rgba(111,227,196,0.1)]"
        }`}
      >
        <Timer
          size={12}
          className={`shrink-0 ${task.completed ? "" : "animate-[spin_4s_linear_infinite]"}`}
        />
        <span>{task.completed ? `${elapsed} spent` : elapsed}</span>
      </div>
      {!task.completed && onStop && (
        <button
          onClick={(e) => { e.stopPropagation(); onStop(); }}
          className="p-1 rounded-md bg-danger/15 text-danger hover:bg-danger/25 transition-colors"
          title="Stop timer & complete task"
        >
          <Square size={12} fill="currentColor" />
        </button>
      )}
    </div>
  );
}

function formatDurationMs(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
