"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { format, isToday as isDateToday, isPast, isFuture, parseISO } from "date-fns";
import { 
  CheckCircle2, Circle, Clock, Plus, MoreHorizontal, LayoutList, LayoutGrid, Calendar as CalendarIcon, Tag
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

export default function TasksPage() {
  const [view, setView] = useState<"list" | "board">("list");
  const [newTaskGroup, setNewTaskGroup] = useState<string | null>(null);
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

  const handleAddTask = async (e: React.FormEvent, group: string) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    // Determine targetDate based on group
    let targetDate = null;
    if (group === "Today") {
      targetDate = format(new Date(), "yyyy-MM-dd");
    } else if (group === "Upcoming") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDate = format(tomorrow, "yyyy-MM-dd");
    } else if (group === "Overdue") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      targetDate = format(yesterday, "yyyy-MM-dd");
    }

    try {
      const res = await fetchWithAuth("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: newTaskTitle,
          completed: false,
          targetDate: targetDate
        }),
      });

      if (res.ok) {
        setNewTaskTitle("");
        setNewTaskGroup(null);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast.success("Task added");
      } else {
        toast.error("Failed to create task");
      }
    } catch {
      toast.error("Failed to create task");
    }
  };

  // Grouping logic
  const todayDate = format(new Date(), "yyyy-MM-dd");
  
  const groups = {
    "Today": tasks.filter(t => !t.completed && t.targetDate === todayDate),
    "Upcoming": tasks.filter(t => !t.completed && t.targetDate && t.targetDate > todayDate),
    "Overdue": tasks.filter(t => !t.completed && t.targetDate && t.targetDate < todayDate),
    "No Date": tasks.filter(t => !t.completed && !t.targetDate),
    "Completed": tasks.filter(t => t.completed)
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <TaskListSkeleton />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Tasks</h1>
          <p className="text-sm text-text-secondary mt-1">Organize and execute your plans</p>
        </div>

        <div className="flex items-center gap-2 bg-bg-surface p-1 rounded-md border border-border-subtle">
          <button 
            onClick={() => setView("list")}
            className={`p-1.5 rounded-sm transition-colors ${view === "list" ? "bg-bg-surface-hover text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}
          >
            <LayoutList size={18} />
          </button>
          <button 
            onClick={() => setView("board")}
            className={`p-1.5 rounded-sm transition-colors ${view === "board" ? "bg-bg-surface-hover text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Task List View */}
      {view === "list" && (
        <div className="space-y-8">
          {Object.entries(groups).map(([groupName, groupTasks]) => {
            if (groupTasks.length === 0 && groupName !== "Today") return null;

            return (
              <div key={groupName} className="space-y-3">
                <div className="flex items-center gap-2 group">
                  <h2 className="text-sm font-medium text-text-primary">{groupName}</h2>
                  <span className="text-xs text-text-tertiary font-medium bg-bg-surface px-1.5 rounded">{groupTasks.length}</span>
                  <button 
                    onClick={() => { setNewTaskGroup(groupName); setNewTaskTitle(""); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-text-primary transition-opacity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="space-y-1">
                  {/* Inline Add Task Input */}
                  {newTaskGroup === groupName && (
                    <form onSubmit={(e) => handleAddTask(e, groupName)} className="flex items-center gap-3 px-3 py-2 bg-bg-surface-raised border border-border-default rounded-md">
                      <Circle size={18} className="text-border-default shrink-0" strokeWidth={2} />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onBlur={() => { if(!newTaskTitle.trim()) setNewTaskGroup(null) }}
                        className="flex-1 bg-transparent border-none text-sm text-text-primary placeholder:text-text-tertiary outline-none"
                      />
                    </form>
                  )}

                  {groupTasks.map((task) => (
                    <motion.div
                      layout
                      key={task.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-bg-surface transition-colors border border-transparent hover:border-border-subtle"
                    >
                      {/* Checkbox */}
                      <button 
                        onClick={() => toggleTask(task.id, task.completed)}
                        className={`shrink-0 transition-colors ${task.completed ? "text-text-tertiary" : "text-border-default hover:text-accent"}`}
                      >
                        {task.completed ? <CheckCircle2 size={18} strokeWidth={2} /> : <Circle size={18} strokeWidth={2} />}
                      </button>

                      {/* Title */}
                      <span className={`text-sm font-medium flex-1 truncate ${task.completed ? "text-text-tertiary line-through" : "text-text-primary"}`}>
                        {task.title}
                      </span>

                      {/* Timer */}
                      <TaskTimer task={task} onStop={() => toggleTask(task.id, task.completed)} />

                      {/* Meta Tags */}
                      <div className="flex items-center gap-2 shrink-0">
                        {task.category && (
                          <Badge variant="outline" className="hidden sm:inline-flex py-0 px-1.5 h-5 text-[10px] gap-1">
                            <Tag size={10} /> {task.category}
                          </Badge>
                        )}
                        
                        {task.targetDate && groupName !== "Today" && (
                          <div className={`hidden sm:flex items-center gap-1 text-[11px] font-medium ${groupName === 'Overdue' ? 'text-danger' : 'text-text-tertiary'}`}>
                            <CalendarIcon size={12} />
                            {format(parseISO(task.targetDate), "MMM d")}
                          </div>
                        )}

                        {task.priority && (
                          <div className="w-1.5 h-1.5 rounded-full" 
                            style={{ backgroundColor: task.priority === 'high' ? 'var(--danger)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--info)' }} 
                            title={`Priority: ${task.priority}`} 
                          />
                        )}

                        {/* Overflow Action (Hover only) */}
                        <button className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-text-primary transition-all ml-1 rounded hover:bg-bg-surface-raised">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {groupTasks.length === 0 && newTaskGroup !== groupName && (
                    <div className="px-3 py-2 text-sm text-text-tertiary">No tasks here.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Board View (Basic Kanban) */}
      {view === "board" && (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {["Today", "Upcoming", "No Date", "Completed"].map((colName) => {
            const colTasks = groups[colName as keyof typeof groups] || [];
            
            return (
              <div key={colName} className="flex-shrink-0 w-[280px] snap-center bg-bg-surface-raised border border-border-subtle rounded-lg p-3 flex flex-col max-h-[70vh]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-semibold text-text-primary">{colName}</h3>
                  <span className="text-xs text-text-tertiary font-medium">{colTasks.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {colTasks.map((task) => (
                    <div key={task.id} className="bg-bg-base border border-border-subtle p-3 rounded-md shadow-sm space-y-2">
                      <div className="flex items-start gap-2">
                        <button onClick={() => toggleTask(task.id, task.completed)} className="mt-0.5 shrink-0 text-text-tertiary hover:text-accent">
                           {task.completed ? <CheckCircle2 size={16} strokeWidth={2} /> : <Circle size={16} strokeWidth={2} />}
                        </button>
                        <p className={`text-sm font-medium ${task.completed ? "text-text-tertiary line-through" : "text-text-primary"}`}>
                          {task.title}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border-subtle">
                        <div className="flex items-center justify-between">
                          <TaskTimer task={task} onStop={() => toggleTask(task.id, task.completed)} />
                          {task.priority && (
                            <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-danger' : task.priority === 'medium' ? 'bg-warning' : 'bg-info'}`} />
                          )}
                        </div>
                        {task.targetDate && (
                           <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                             <CalendarIcon size={10} /> {format(parseISO(task.targetDate), "MMM d")}
                           </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => { setNewTaskGroup(colName); setView("list"); }}
                    className="w-full flex items-center justify-center gap-1 p-2 text-xs font-medium text-text-tertiary hover:text-text-primary hover:bg-bg-surface rounded-md transition-colors border border-dashed border-border-subtle"
                  >
                    <Plus size={14} /> Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
