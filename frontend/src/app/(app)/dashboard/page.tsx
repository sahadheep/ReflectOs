"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Star,
  Target,
  ArrowRight,
  CheckCircle2,
  Circle,
  Flame,
  TrendingUp,
  Clock,
  AlertCircle,
  Zap,
  Edit2,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority?: string;
  dueTime?: string;
  category?: string;
  estimatedDuration?: number;
}

interface Stats {
  completedToday: number;
  totalToday: number;
  currentStreak: number;
  productivityScore: number;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState<Stats>({
    completedToday: 0,
    totalToday: 0,
    currentStreak: 0,
    productivityScore: 0,
  });

  const today = format(new Date(), "yyyy-MM-dd");

  const loadData = async () => {
    try {
      const tasksRes = await fetchWithAuth(`/tasks/daily?date=${today}`);
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
        
        // Compute stats locally since the backend endpoint doesn't exist
        const completedToday = tasksData.filter((t: any) => t.completed).length;
        const totalToday = tasksData.length;
        const productivityScore = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
        
        setStats({
          completedToday,
          totalToday,
          productivityScore,
          currentStreak: 0, // Need historical data for streak, hardcode to 0 for now
        });
      } else {
        setError(true);
        toast.error("Failed to load tasks");
      }
    } catch {
      setError(true);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [today]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetchWithAuth("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: newTaskTitle,
          completed: false,
        }),
      });

      if (res.ok) {
        setNewTaskTitle("");
        loadData();
        toast.success("Task created");
      } else {
        toast.error("Failed to create task");
      }
    } catch {
      toast.error("Failed to create task");
    }
  };

  const toggleTask = async (id: number, completed: boolean) => {
    try {
      const res = await fetchWithAuth(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !completed }),
      });

      if (res.ok) {
        setTasks(
          tasks.map((t) => (t.id === id ? { ...t, completed: !completed } : t)),
        );
        toast.success(!completed ? "Task completed!" : "Task reopened");
        loadData();
      } else {
        toast.error("Failed to update task");
      }
    } catch {
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const res = await fetchWithAuth(`/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== id));
        toast.success("Task deleted");
      } else {
        toast.error("Failed to delete task");
      }
    } catch {
      toast.error("Failed to delete task");
    }
  };

  if (loading) return <LoadingScreen message="Loading your dashboard..." />;
  if (error)
    return <ErrorState title="Couldn't load dashboard" onRetry={loadData} />;

  const completionRate =
    tasks.length > 0
      ? Math.round((stats.completedToday / tasks.length) * 100)
      : 0;
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      {/* Header section with greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/40 backdrop-blur-md p-8 shadow-glow"
      >
        {/* Animated Background Gradients */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-white">{greeting} 👋</h1>
            <p className="text-primary-foreground/70 mt-3 text-lg font-medium">
              {format(new Date(), "EEEE, MMMM do")} • Let's make it count
            </p>
          </div>
          <div className="text-right bg-black/20 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="text-5xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
              {completionRate}%
            </div>
            <div className="text-sm font-medium text-muted-foreground mt-1">Completion Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          {
            icon: CheckCircle2,
            label: "Completed",
            value: stats.completedToday,
            total: tasks.length,
            color: "text-success",
          },
          {
            icon: Flame,
            label: "Streak",
            value: stats.currentStreak,
            unit: "days",
            color: "text-warning",
          },
          {
            icon: TrendingUp,
            label: "Productivity",
            value: stats.productivityScore,
            unit: "%",
            color: "text-primary",
          },
          {
            icon: Clock,
            label: "Focus Time",
            value: Math.round(stats.productivityScore * 1.5),
            unit: "min",
            color: "text-blue-500",
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + idx * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="card-elevated p-6 space-y-4 rounded-2xl relative overflow-hidden group bg-gradient-to-b from-card/80 to-card/40">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors">
                    <Icon size={20} className={stat.color} />
                  </div>
                  <TrendingUp size={14} className="text-primary/70" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stat.value}
                    {stat.unit && (
                      <span className="text-sm text-muted-foreground ml-1">
                        {stat.unit}
                      </span>
                    )}
                    {stat.total && (
                      <span className="text-sm text-muted-foreground ml-1">
                        / {stat.total}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tasks Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Today's Tasks</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.completedToday} of {tasks.length} completed
            </p>
          </div>
        </div>

        {/* Add Task Input */}
        <form onSubmit={handleAddTask} className="flex gap-3">
          <Input
            placeholder="Add a new task... press Enter"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="card-elevated py-3 px-4 text-base rounded-xl border-primary/20 focus:border-primary focus:ring-primary/50 transition-all bg-card/60 backdrop-blur-sm"
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button type="submit" size="lg" className="gap-2 rounded-xl">
              <Plus size={20} /> Add
            </Button>
          </motion.div>
        </form>

        {/* Tasks List */}
        <div className="space-y-2">
          <AnimatePresence>
            {tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 card-elevated rounded-xl"
              >
                <CheckCircle2
                  size={48}
                  className="mx-auto text-muted-foreground/30 mb-4"
                />
                <p className="text-muted-foreground text-lg">
                  No tasks yet. Add one to get started!
                </p>
              </motion.div>
            ) : (
              tasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="card-elevated p-4 flex items-center gap-4 group rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                    onClick={() => toggleTask(task.id, task.completed)}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex-shrink-0 relative flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors duration-300"
                      style={{ 
                        borderColor: task.completed ? "var(--primary)" : "var(--muted-foreground)",
                        backgroundColor: task.completed ? "var(--primary)" : "transparent"
                      }}
                    >
                      <AnimatePresence>
                        {task.completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <CheckCircle2 size={16} className="text-white absolute inset-0 m-auto" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    
                    <span
                      className={`flex-1 text-base font-medium transition-all duration-300 ${
                        task.completed
                          ? "line-through text-muted-foreground opacity-70"
                          : "text-foreground group-hover:text-primary"
                      }`}
                    >
                      {task.title}
                    </span>

                  {task.dueTime && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={14} /> {task.dueTime}
                    </span>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
