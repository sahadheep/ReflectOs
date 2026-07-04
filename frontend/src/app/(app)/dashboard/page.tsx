"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { 
  CheckCircle2, Circle, Flame, ChevronRight, ChevronDown 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { TaskTimer } from "@/components/ui/task-timer";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const loadData = async () => {
    try {
      // 1. Fetch Today's Tasks
      const tasksRes = await fetchWithAuth(`/tasks/daily?date=${todayStr}`);
      const tasksData = tasksRes.ok ? await tasksRes.json() : [];
      setTasks(tasksData);

      // 2. Fetch Analytics for week-at-a-glance
      const analyticsRes = await fetchWithAuth(`/analytics/summary`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        const last7Days = analyticsData.dailyStats.slice(-7);
        setWeeklyStats(last7Days);
      }
    } catch {
      setError(true);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleTask = async (id: number, completed: boolean) => {
    // Optimistic UI
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t));
    try {
      const res = await fetchWithAuth(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !completed }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
      toast.error("Failed to update task");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetchWithAuth("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: newTaskTitle,
          completed: false,
          targetDate: todayStr
        }),
      });

      if (res.ok) {
        setNewTaskTitle("");
        loadData();
        toast.success("Task added and timer started!");
      } else {
        toast.error("Failed to create task");
      }
    } catch {
      toast.error("Failed to create task");
    }
  };

  if (loading) return <LoadingScreen message="" />;
  if (error) return <ErrorState title="Couldn't load dashboard" onRetry={loadData} />;

  const completedTasks = tasks.filter(t => t.completed);
  const activeTasks = tasks.filter(t => !t.completed);
  
  // Hardcoded streak for now since backend doesn't track it explicitly yet
  const streak = 3; 

  const chartData = weeklyStats.map(stat => ({
    day: format(parseISO(stat.date), "EEE"),
    completed: stat.tasksCompleted
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight">
          {format(new Date(), "EEEE, MMMM d")}
        </h1>
        <p className="text-text-secondary text-lg">
          {streak > 0 ? `Day ${streak} — keep it going.` : "Ready to focus?"}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Column 1: Tasks (Takes up more space) */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Today's Tasks</h2>
          </div>

          {/* Quick Add Inline Input */}
          <form onSubmit={handleAddTask} className="flex items-center gap-3 px-3 py-2 bg-bg-surface-raised border border-border-default rounded-md">
            <Circle size={18} className="text-border-default shrink-0" strokeWidth={2} />
            <input
              type="text"
              placeholder="Add a new task for today..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm text-text-primary placeholder:text-text-tertiary outline-none"
            />
          </form>

          {tasks.length === 0 ? (
            <div className="text-center py-12 text-sm text-text-tertiary">
              No tasks for today. Type above to start focusing!
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Tasks */}
              <div className="space-y-1">
                {activeTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 py-2 group"
                  >
                    <button 
                      onClick={() => toggleTask(task.id, task.completed)}
                      className="text-border-default hover:text-accent transition-colors"
                    >
                      <Circle size={18} strokeWidth={2} />
                    </button>
                    <span className="text-sm font-medium text-text-primary flex-1">{task.title}</span>
                    <TaskTimer task={task} onStop={() => toggleTask(task.id, task.completed)} />
                    {task.priority && (
                      <span className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-danger' : task.priority === 'medium' ? 'bg-warning' : 'bg-info'}`} />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Completed Tasks Disclosure */}
              {completedTasks.length > 0 && (
                <div className="pt-4 border-t border-border-subtle">
                  <button 
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showCompleted ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {completedTasks.length} completed
                  </button>
                  
                  <AnimatePresence>
                    {showCompleted && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-2 space-y-1"
                      >
                        {completedTasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-3 py-2 opacity-50">
                            <button 
                              onClick={() => toggleTask(task.id, task.completed)}
                              className="text-text-tertiary hover:text-text-primary transition-colors"
                            >
                              <CheckCircle2 size={18} strokeWidth={2} />
                            </button>
                            <span className="text-sm font-medium text-text-primary line-through flex-1">{task.title}</span>
                            <TaskTimer task={task} onStop={() => toggleTask(task.id, task.completed)} />
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Column 2: Week at a glance */}
        <section className="lg:col-span-4 space-y-6">
          <div className="card-editorial p-6 space-y-6">
            <h2 className="text-sm font-medium text-text-secondary">This week</h2>
            
            <div className="flex items-end gap-2">
              <Flame size={28} className="text-warning mb-1" strokeWidth={2} />
              <div className="text-3xl font-semibold text-text-primary leading-none">{streak}</div>
              <div className="text-sm text-text-tertiary mb-1 font-medium">day streak</div>
            </div>

            <div className="h-[120px] w-full pt-4 border-t border-border-subtle mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} 
                    dy={5}
                  />
                  <Tooltip 
                    cursor={{ fill: "var(--bg-surface-hover)" }}
                    contentStyle={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar 
                    dataKey="completed" 
                    fill="var(--accent)" 
                    radius={[4, 4, 4, 4]} 
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
