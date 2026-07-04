"use client";

import { useState, use } from "react";
import { fetchWithAuth } from "@/lib/api";
import { format, isToday as isDateToday, addDays, parseISO, isPast } from "date-fns";
import { 
  CheckCircle2, Circle, Plus, MoreHorizontal, Calendar as CalendarIcon, Tag, Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { TaskListSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { TaskTimer } from "@/components/ui/task-timer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority?: "low" | "medium" | "high";
  targetDate?: string; // YYYY-MM-DD
  category?: string;
  createdAt?: string;
  completedAt?: string;
}

export default function TasksPage({ params }: { params: Promise<{ filter?: string[] }> }) {
  const unwrappedParams = use(params);
  const filterParams = unwrappedParams.filter || [];
  
  const [newTaskCol, setNewTaskCol] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading: loading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetchWithAuth("/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      return res.json();
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      const res = await fetchWithAuth(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], old => 
        old?.map(t => t.id === id ? { ...t, completed } : t)
      );
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["tasks"], context?.previousTasks);
      toast.error("Failed to update task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const toggleTask = (id: number, currentCompleted: boolean) => {
    toggleMutation.mutate({ id, completed: !currentCompleted });
  };

  const handleAddTask = async (e: React.FormEvent, targetDate: string | null = null, defaultCategory: string = "General") => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetchWithAuth("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: newTaskTitle,
          completed: false,
          targetDate: targetDate,
          category: defaultCategory
        }),
      });

      if (res.ok) {
        setNewTaskTitle("");
        setNewTaskCol(null);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast.success("Task added");
      } else {
        toast.error("Failed to create task");
      }
    } catch {
      toast.error("Failed to create task");
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <TaskListSkeleton />
    </div>
  );

  // --- Filter logic for specific sidebar views (Inbox, Today, Upcoming, etc.) ---
  if (filterParams.length > 0) {
    const viewType = filterParams[0];
    const todayDate = format(new Date(), "yyyy-MM-dd");
    let viewTitle = "";
    let filteredTasks: Task[] = [];
    let defaultCategory = "General";

    if (viewType === "inbox") {
      viewTitle = "Inbox";
      filteredTasks = tasks.filter(t => !t.targetDate && t.category === "General" && !t.completed);
    } else if (viewType === "today") {
      viewTitle = "Today";
      filteredTasks = tasks.filter(t => t.targetDate === todayDate && !t.completed);
    } else if (viewType === "upcoming") {
      viewTitle = "Upcoming";
      filteredTasks = tasks.filter(t => t.targetDate && t.targetDate > todayDate && !t.completed);
    } else if (viewType === "anytime") {
      viewTitle = "Anytime";
      filteredTasks = tasks.filter(t => !t.targetDate && !t.completed);
    } else if (viewType === "someday") {
      viewTitle = "Someday";
      filteredTasks = tasks.filter(t => t.priority === "low" && !t.targetDate && !t.completed);
    } else if (viewType === "logbook") {
      viewTitle = "Logbook";
      filteredTasks = tasks.filter(t => t.completed);
    } else if (viewType === "list" && filterParams[1]) {
      const category = decodeURIComponent(filterParams[1]);
      viewTitle = category;
      defaultCategory = category;
      filteredTasks = tasks.filter(t => t.category === category && !t.completed);
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <h1 className="text-2xl font-bold text-text-primary">{viewTitle}</h1>
        </div>

        <div className="space-y-3">
          {viewType !== "logbook" && (
            <form onSubmit={(e) => handleAddTask(e, viewType === "today" ? todayDate : null, defaultCategory)} className="flex items-center gap-3 px-3 py-2 bg-bg-surface-raised border border-border-default rounded-md focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50 transition-all">
              <Plus size={18} className="text-border-default shrink-0" strokeWidth={2} />
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm text-text-primary placeholder:text-text-tertiary outline-none"
              />
              {newTaskTitle.trim() && (
                <button 
                  type="submit"
                  className="shrink-0 bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                >
                  Add Task
                </button>
              )}
            </form>
          )}

          <div className="space-y-1">
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={task.id}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-bg-surface transition-colors border border-transparent hover:border-border-subtle"
                >
                  <button 
                    onClick={() => toggleTask(task.id, task.completed)}
                    className={`shrink-0 transition-colors ${task.completed ? "text-text-tertiary" : "text-border-default hover:text-accent"}`}
                  >
                    {task.completed ? <CheckCircle2 size={18} strokeWidth={2} /> : <Circle size={18} strokeWidth={2} />}
                  </button>

                  <span className={`text-sm font-medium flex-1 truncate ${task.completed ? "text-text-tertiary line-through" : "text-text-primary"}`}>
                    {task.title}
                  </span>

                  <TaskTimer task={task} onStop={() => toggleTask(task.id, task.completed)} />

                  <div className="flex items-center gap-2 shrink-0">
                    {task.category && task.category !== defaultCategory && (
                      <Badge variant="outline" className="hidden sm:inline-flex py-0 px-1.5 h-5 text-[10px] gap-1">
                        <Tag size={10} /> {task.category}
                      </Badge>
                    )}
                    
                    {task.targetDate && viewType !== "today" && (
                      <div className={`hidden sm:flex items-center gap-1 text-[11px] font-medium ${isPast(parseISO(task.targetDate)) && !isDateToday(parseISO(task.targetDate)) ? 'text-danger' : 'text-text-tertiary'}`}>
                        <CalendarIcon size={12} />
                        {format(parseISO(task.targetDate), "MMM d")}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredTasks.length === 0 && (
              <div className="px-3 py-12 text-sm text-text-tertiary text-center">Nothing here right now.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Main Board View (Sunsama style) ---
  const today = new Date();
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(today, i);
    return {
      dateObj: date,
      dateString: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEEE"),
      shortDate: format(date, "MMM d")
    };
  });

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Weekly Plan</h1>
          <p className="text-sm text-text-secondary mt-1">Start Calm. Stay Focused. End Confident.</p>
        </div>
      </div>

      {/* Horizontal Scrollable Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
        <div className="flex gap-4 h-full px-1">
          {next7Days.map((day) => {
            const dayTasks = tasks.filter(t => t.targetDate === day.dateString && !t.completed);
            
            return (
              <div key={day.dateString} className="flex-shrink-0 w-[300px] flex flex-col h-full">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text-primary">
                      {isDateToday(day.dateObj) ? "Today" : day.dayName}
                    </span>
                    <span className="text-xs text-text-tertiary font-medium">{day.shortDate}</span>
                  </div>
                  <span className="text-xs text-text-tertiary font-medium bg-bg-surface-raised px-2 py-0.5 rounded-full border border-border-subtle">
                    {dayTasks.length} tasks
                  </span>
                </div>
                
                {/* Column Body */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  
                  {/* Quick Add */}
                  {newTaskCol === day.dateString ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddTask(e, day.dateString);
                        // Prevent blur from closing the form immediately after submit if they clicked the button
                        // but handleAddTask resets newTaskCol to null anyway.
                      }} 
                      className="bg-bg-surface border border-accent rounded-md p-2 mb-2 shadow-sm space-y-2"
                    >
                      <input
                        autoFocus
                        type="text"
                        placeholder="What are you working on?"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full bg-transparent border-none text-sm text-text-primary placeholder:text-text-tertiary outline-none"
                      />
                      <div className="flex justify-end gap-2 pt-1 border-t border-border-subtle">
                        <button 
                          type="button" 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setNewTaskCol(null);
                          }}
                          className="px-2 py-1 text-xs font-medium text-text-tertiary hover:text-text-primary transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          onMouseDown={(e) => e.preventDefault()} // Prevent blur so click registers
                          disabled={!newTaskTitle.trim()}
                          className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Task
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button 
                      onClick={() => { setNewTaskCol(day.dateString); setNewTaskTitle(""); }}
                      className="w-full flex items-center justify-start gap-2 p-2 mb-2 text-sm font-medium text-text-tertiary hover:text-text-primary hover:bg-bg-surface-raised rounded-md transition-colors group border border-transparent hover:border-border-subtle"
                    >
                      <Plus size={16} className="text-text-tertiary group-hover:text-accent transition-colors" /> Add a task
                    </button>
                  )}

                  {/* Task Cards */}
                  <AnimatePresence>
                    {dayTasks.map((task) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={task.id} 
                        className="bg-bg-surface-raised border border-border-subtle hover:border-border-default p-3 rounded-md shadow-sm space-y-2 group transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <button onClick={() => toggleTask(task.id, task.completed)} className="mt-0.5 shrink-0 text-text-tertiary hover:text-accent transition-colors">
                            <Circle size={16} strokeWidth={2} />
                          </button>
                          <p className="text-sm font-medium text-text-primary leading-tight pt-0.5">
                            {task.title}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle">
                          <TaskTimer task={task} onStop={() => toggleTask(task.id, task.completed)} />
                          
                          <div className="flex gap-1 items-center">
                            {task.category && task.category !== "General" && (
                              <span className="text-[10px] font-medium text-text-secondary bg-bg-base px-1.5 py-0.5 rounded border border-border-subtle truncate max-w-[80px]">
                                #{task.category.toLowerCase().replace(/\s+/g, '')}
                              </span>
                            )}
                            {task.priority === 'high' && <Flame size={12} className="text-danger" />}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
