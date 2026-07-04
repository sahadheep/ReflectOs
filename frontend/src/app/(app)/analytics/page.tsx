"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { format, parseISO, subDays } from "date-fns";
import { Flame, CheckSquare, Target } from "lucide-react";

interface DailyStat {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  productivityScore: number;
  mood: string | null;
  diaryLogged: boolean;
}

interface AnalyticsSummary {
  totalEntriesLogged: number;
  topMood: string;
  daysTracked: number;
  dailyStats: DailyStat[];
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetchWithAuth("/analytics/summary");
        if (!response.ok) throw new Error("Failed to fetch analytics");
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) return <LoadingScreen message="" />;
  if (error || !summary) return <ErrorState title="Could not load analytics" onRetry={() => window.location.reload()} />;

  const chartData = summary.dailyStats.map(stat => ({
    name: format(parseISO(stat.date), "MMM d"),
    completed: stat.tasksCompleted,
    total: stat.tasksTotal,
    score: Math.round(stat.productivityScore * 100)
  }));

  // Calculate some aggregate stats
  const totalTasks = summary.dailyStats.reduce((acc, curr) => acc + curr.tasksCompleted, 0);
  const avgScore = summary.dailyStats.length > 0 
    ? Math.round(summary.dailyStats.reduce((acc, curr) => acc + curr.productivityScore, 0) / summary.dailyStats.length * 100) 
    : 0;
  
  // Heatmap generation (last 30 days mapped to a grid)
  const today = new Date();
  const heatmapDays = Array.from({ length: 30 }).map((_, i) => {
    const d = subDays(today, 29 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const stat = summary.dailyStats.find(s => s.date === dateStr);
    return {
      date: d,
      level: stat ? (stat.tasksCompleted > 0 ? (stat.productivityScore > 0.7 ? 3 : stat.productivityScore > 0.4 ? 2 : 1) : 0) : 0
    };
  });

  return (
    <div className="space-y-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both pb-12">
      
      <header className="border-b border-border-subtle pb-4">
        <h1 className="text-2xl font-semibold text-text-primary">Analytics</h1>
        <p className="text-sm text-text-secondary mt-1">Insights and patterns from the last 30 days</p>
      </header>

      {/* 1. Productivity Trend (Area Chart) */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Productivity Trend</h2>
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="var(--text-tertiary)" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="var(--text-tertiary)" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${val}%`} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "8px", fontSize: "12px", color: "var(--text-primary)" }}
                itemStyle={{ color: "var(--accent)" }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="var(--accent)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                activeDot={{ r: 6, fill: "var(--bg-base)", stroke: "var(--accent)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 2. Weekly Focus Heatmap & 3. Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Heatmap */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Focus Consistency</h2>
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <div className="flex flex-wrap gap-2">
              {heatmapDays.map((day, i) => {
                let bgClass = "bg-bg-surface-raised border-border-subtle";
                if (day.level === 1) bgClass = "bg-accent/30 border-accent/20";
                if (day.level === 2) bgClass = "bg-accent/60 border-accent/40";
                if (day.level === 3) bgClass = "bg-accent border-accent";

                return (
                  <div 
                    key={i} 
                    title={`${format(day.date, "MMM d")}: Level ${day.level}`}
                    className={`w-5 h-5 rounded-sm border ${bgClass} transition-colors hover:ring-2 hover:ring-offset-2 hover:ring-accent hover:ring-offset-bg-surface`}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-4 text-[10px] text-text-tertiary font-medium">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-[2px] bg-bg-surface-raised border border-border-subtle" />
                <div className="w-3 h-3 rounded-[2px] bg-accent/30 border border-accent/20" />
                <div className="w-3 h-3 rounded-[2px] bg-accent/60 border border-accent/40" />
                <div className="w-3 h-3 rounded-[2px] bg-accent border border-accent" />
              </div>
              <span>More</span>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            
            <div className="bg-bg-surface border border-border-subtle p-5 rounded-xl flex flex-col justify-between">
              <div className="text-text-tertiary mb-4"><CheckSquare size={18} /></div>
              <div>
                <p className="text-2xl font-semibold text-text-primary">{totalTasks}</p>
                <p className="text-xs text-text-secondary mt-1">Tasks Completed</p>
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle p-5 rounded-xl flex flex-col justify-between">
              <div className="text-text-tertiary mb-4"><Target size={18} /></div>
              <div>
                <p className="text-2xl font-semibold text-text-primary">{avgScore}%</p>
                <p className="text-xs text-text-secondary mt-1">Average Focus Score</p>
              </div>
            </div>

          </div>
        </section>

      </div>

    </div>
  );
}
