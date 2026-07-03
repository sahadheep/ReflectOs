"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, CheckCircle2, CalendarDays, Flame } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { format, parseISO } from "date-fns";

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

const moodEmojis: Record<string, string> = {
  great: "😁",
  good: "🙂",
  okay: "😐",
  bad: "😔",
  terrible: "😫"
};

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

  if (loading) return <LoadingScreen />;
  if (error || !summary) return <ErrorState message="Could not load analytics. Please try again later." onRetry={() => window.location.reload()} />;

  const chartData = summary.dailyStats.map(stat => ({
    name: format(parseISO(stat.date), "MMM d"),
    score: Math.round(stat.productivityScore * 100)
  }));

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Activity size={32} className="text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-primary-foreground/70 mt-2 font-medium">Your 30-day productivity overview</p>
        </div>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 rounded-xl bg-primary/20 text-primary">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Diary Entries</p>
            <p className="text-2xl font-bold text-white">{summary.totalEntriesLogged}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 rounded-xl bg-primary/20 text-primary">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Top Mood</p>
            <p className="text-2xl font-bold text-white capitalize">
              {summary.topMood !== "N/A" ? `${moodEmojis[summary.topMood] || ""} ${summary.topMood}` : "N/A"}
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 rounded-xl bg-primary/20 text-primary">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Days Tracked</p>
            <p className="text-2xl font-bold text-white">{summary.daysTracked} / 30</p>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-panel p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-6">Productivity Score (Last 30 Days)</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                itemStyle={{ color: "#3b82f6" }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8, stroke: "#60a5fa", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
