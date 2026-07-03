"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2 } from "lucide-react";
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
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [tasksRes, diaryRes] = await Promise.all([
        fetchWithAuth("/tasks/history"),
        fetchWithAuth("/diary/history")
      ]);

      if (tasksRes.ok && diaryRes.ok) {
        const tasksData = await tasksRes.json();
        const diaryData = await diaryRes.json();

        const entriesMap: Record<string, CalendarEntry> = {};

        tasksData.forEach((task: any) => {
          if (!task.targetDate) return;
          if (!entriesMap[task.targetDate]) {
            entriesMap[task.targetDate] = { date: task.targetDate, taskCount: 0, completedCount: 0, diaryLocked: false };
          }
          entriesMap[task.targetDate].taskCount++;
          if (task.completed) {
            entriesMap[task.targetDate].completedCount++;
          }
        });

        diaryData.forEach((diary: any) => {
          if (!diary.date) return;
          if (!entriesMap[diary.date]) {
            entriesMap[diary.date] = { date: diary.date, taskCount: 0, completedCount: 0, diaryLocked: false };
          }
          entriesMap[diary.date].diaryLocked = diary.locked;
          entriesMap[diary.date].mood = diary.mood;
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingScreen message="Loading calendar..." />;
  if (error) return <ErrorState title="Couldn't load calendar" onRetry={loadData} />;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getProductivityColor = (date: string) => {
    const entry = entries[date];
    if (!entry) return "bg-white/5";
    if (!entry.diaryLocked) return "bg-white/5";

    const completion = entry.taskCount > 0 ? entry.completedCount / entry.taskCount : 0;
    if (completion === 1) return "bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]";
    if (completion >= 0.75) return "bg-primary/75";
    if (completion >= 0.5) return "bg-primary/50";
    if (completion >= 0.25) return "bg-primary/25";
    return "bg-white/5";
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
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/40 backdrop-blur-md p-8 shadow-glow"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 text-white">
              <Calendar size={32} className="text-primary" /> Calendar
            </h1>
            <p className="text-primary-foreground/70 mt-2 font-medium">Track your productivity and habits</p>
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
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
        >
          <ChevronLeft size={20} />
        </Button>
        <h2 className="text-2xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
        >
          <ChevronRight size={20} />
        </Button>
      </motion.div>

      {/* Calendar grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-panel p-8 rounded-3xl space-y-6"
      >
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
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
                onClick={() => setSelectedDateStr(dateStr)}
                className={`relative aspect-square rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all border ${
                  selectedDateStr === dateStr ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 z-20" : ""
                } ${
                  inMonth ? getProductivityColor(dateStr) : "bg-card/20 border-transparent opacity-40"
                } ${today && selectedDateStr !== dateStr ? "border-primary border-2" : "border-border/10 hover:border-primary/40"} overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 text-xs font-bold text-foreground">
                  {format(day, "d")}
                </div>
                {entry && (
                  <div className="relative z-10 mt-1 text-center">
                    {entry.diaryLocked && entry.mood && (
                      <div className="text-lg drop-shadow-md transition-transform group-hover:scale-110">
                        {moodEmojis[entry.mood] || entry.mood}
                      </div>
                    )}
                    {entry.taskCount > 0 && (
                      <div className="text-[10px] font-semibold text-white/90 mt-1 bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
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

      {/* Legend & Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-2 grid grid-cols-2 gap-4 card-elevated p-6 rounded-xl"
        >
          {[
            { color: "bg-primary shadow-glow", label: "100% Complete" },
            { color: "bg-primary/75", label: "75% Complete" },
            { color: "bg-primary/50", label: "50% Complete" },
            { color: "bg-primary/25", label: "Started" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-md ${item.color}`} />
              <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 glass-panel p-6 rounded-xl flex flex-col justify-center"
        >
          {selectedDateStr ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-border/20 pb-2">
                {format(new Date(selectedDateStr), "MMMM do, yyyy")}
              </h3>
              {entries[selectedDateStr] ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tasks</span>
                    <span className="font-semibold text-primary">
                      {entries[selectedDateStr].completedCount} / {entries[selectedDateStr].taskCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Diary</span>
                    <span className="font-semibold">
                      {entries[selectedDateStr].diaryLocked ? "Locked 🔒" : "Empty"}
                    </span>
                  </div>
                  {entries[selectedDateStr].mood && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Mood</span>
                      <span className="text-xl">{moodEmojis[entries[selectedDateStr].mood!] || entries[selectedDateStr].mood}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">No data recorded for this date.</p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-2">
              <Calendar size={24} className="mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Select a date to view details</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
