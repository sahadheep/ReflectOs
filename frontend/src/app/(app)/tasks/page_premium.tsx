"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface CalendarEntry {
  date: string;
  taskCount: number;
  completedCount: number;
  diaryLocked: boolean;
  mood?: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<Record<string, CalendarEntry>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const res = await fetchWithAuth(
        `/calendar?start=${format(start, "yyyy-MM-dd")}&end=${format(end, "yyyy-MM-dd")}`,
      );

      if (res.ok) {
        const data = await res.json();
        const entriesMap: Record<string, CalendarEntry> = {};
        data.forEach((entry: CalendarEntry) => {
          entriesMap[entry.date] = entry;
        });
        setEntries(entriesMap);
      } else {
        setError(true);
        toast.error("Failed to load calendar");
      }
    } catch {
      setError(true);
      toast.error("Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingScreen message="Loading calendar..." />;
  if (error)
    return <ErrorState title="Couldn't load calendar" onRetry={loadData} />;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getProductivityColor = (date: string) => {
    const entry = entries[date];
    if (!entry) return "bg-muted/20";
    if (!entry.diaryLocked) return "bg-muted/20";

    const completion =
      entry.taskCount > 0 ? entry.completedCount / entry.taskCount : 0;
    if (completion === 1) return "bg-success/60";
    if (completion >= 0.75) return "bg-success/40";
    if (completion >= 0.5) return "bg-primary/40";
    if (completion >= 0.25) return "bg-warning/30";
    return "bg-muted/20";
  };

  const moodEmojis: Record<string, string> = {
    great: "😀",
    good: "🙂",
    normal: "😐",
    sad: "😔",
    exhausted: "😫",
    frustrated: "😡",
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Calendar size={32} /> Calendar
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your productivity and habits
            </p>
          </div>
        </div>
      </motion.div>

      {/* Month navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
            )
          }
        >
          <ChevronLeft size={20} />
        </Button>
        <h2 className="text-2xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
            )
          }
        >
          <ChevronRight size={20} />
        </Button>
      </motion.div>

      {/* Calendar grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card-elevated p-6 rounded-xl space-y-6"
      >
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const entry = entries[dateStr];
            const today = isToday(day);
            const inMonth = isSameMonth(day, currentDate);

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                className={`aspect-square rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  inMonth ? getProductivityColor(dateStr) : "bg-muted/10"
                } ${today ? "ring-2 ring-primary" : ""}`}
              >
                <div className="text-xs font-semibold text-muted-foreground">
                  {format(day, "d")}
                </div>
                {entry && (
                  <div className="mt-1 text-center">
                    {entry.diaryLocked && entry.mood && (
                      <div className="text-lg">
                        {moodEmojis[entry.mood] || entry.mood}
                      </div>
                    )}
                    {entry.taskCount > 0 && (
                      <div className="text-xs font-medium text-foreground/80">
                        {entry.completedCount}/{entry.taskCount}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { color: "bg-success/60", label: "100% Complete" },
          { color: "bg-success/40", label: "75% Complete" },
          { color: "bg-primary/40", label: "50% Complete" },
          { color: "bg-warning/30", label: "Started" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-4 card-elevated rounded-lg"
          >
            <div className={`w-4 h-4 rounded ${item.color}`} />
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
