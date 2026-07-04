"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";
import { format, isToday, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Loader2, Edit3, CheckCircle2 } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface DiaryEntry {
  id?: number;
  date: string;
  mood?: string;
  contentDraft?: string;
  contentSubmitted?: string;
  text?: string; // some endpoints return 'text' instead of content
  locked: boolean;
}

export default function DiaryPage() {
  const [history, setHistory] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const loadData = useCallback(async () => {
    try {
      // Fetch history for sidebar
      const historyRes = await fetchWithAuth("/diary/history");
      let historyData: DiaryEntry[] = [];
      if (historyRes.ok) {
        historyData = await historyRes.json();
        // Sort descending by date
        historyData.sort((a, b) => b.date.localeCompare(a.date));
      }

      // Ensure today's entry exists in the sidebar at the top if it doesn't already
      if (!historyData.find(e => e.date === todayStr)) {
        historyData.unshift({ date: todayStr, locked: false, contentDraft: "" });
      }
      setHistory(historyData);
      
      // Load initially selected date (today)
      loadEntryForDate(todayStr);
    } catch {
      toast.error("Failed to load diary");
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadEntryForDate = async (dateStr: string) => {
    setSelectedDate(dateStr);
    try {
      // The API endpoint might just be `/diary/daily?date=`
      const res = await fetchWithAuth(`/diary/daily?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentEntry(data);
        setContent(data.contentDraft || data.text || data.contentSubmitted || "");
      } else {
        // Not found, assume empty
        setCurrentEntry({ date: dateStr, locked: false });
        setContent("");
      }
    } catch {
      toast.error("Failed to load entry");
    }
  };

  const saveDraft = async (newContent: string) => {
    if (currentEntry?.locked || selectedDate !== todayStr) return;
    setContent(newContent);
    setSaving(true);
    
    // Auto-save logic
    try {
      await fetchWithAuth(`/diary/daily`, {
        method: "POST",
        body: JSON.stringify({ 
          date: todayStr, 
          text: newContent, 
          content: newContent, // send both to be safe depending on backend mapping
          mood: "normal", 
          locked: false 
        }),
      });
    } catch {
      // Silently fail auto-save or show tiny indicator
    } finally {
      setSaving(false);
    }
  };

  const handleLock = async () => {
    if (!content.trim()) return;
    if (!confirm("Are you sure? Locking an entry means it cannot be edited again.")) return;

    try {
      const res = await fetchWithAuth(`/diary/submit?date=${todayStr}`, {
        method: "POST",
        body: JSON.stringify({ mood: "normal", content }),
      });
      
      if (res.ok) {
        toast.success("Entry locked");
        loadData(); // Reload to reflect locked status
      } else {
        toast.error("Failed to lock entry");
      }
    } catch {
      toast.error("Network error");
    }
  };

  if (loading) return <LoadingScreen message="" />;

  const isTodaySelected = selectedDate === todayStr;
  const isLocked = currentEntry?.locked || (!isTodaySelected && selectedDate !== todayStr);

  return (
    <div className="h-full flex overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both border border-border-subtle rounded-xl bg-bg-surface-raised">
      
      {/* Left Column: History List */}
      <div className="w-[300px] border-r border-border-subtle flex flex-col shrink-0">
        <div className="h-16 flex items-center px-4 border-b border-border-subtle shrink-0">
          <h2 className="text-sm font-semibold text-text-primary">Journal History</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {history.map((entry) => {
            const isSelected = selectedDate === entry.date;
            const snippet = entry.contentSubmitted || entry.contentDraft || entry.text || "No reflection written.";
            
            return (
              <button
                key={entry.date}
                onClick={() => loadEntryForDate(entry.date)}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  isSelected ? "bg-bg-surface-hover shadow-sm" : "hover:bg-bg-surface-hover/50 text-text-secondary"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold ${isSelected ? "text-text-primary" : ""}`}>
                    {entry.date === todayStr ? "Today" : format(parseISO(entry.date), "MMM d, yyyy")}
                  </span>
                  {entry.locked ? (
                    <Lock size={12} className="text-text-tertiary" />
                  ) : (
                    entry.date === todayStr && <Edit3 size={12} className="text-accent" />
                  )}
                </div>
                <p className="text-xs text-text-tertiary truncate leading-tight">
                  {snippet}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right Column: Editor */}
      <div className="flex-1 flex flex-col bg-bg-base relative">
        {/* Editor Header */}
        <div className="h-16 flex items-center justify-between px-8 border-b border-border-subtle shrink-0">
          <h1 className="text-xl font-serif font-semibold text-text-primary">
            {isTodaySelected ? format(new Date(), "EEEE, MMMM d") : format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}
          </h1>
          
          <div className="flex items-center gap-4">
            {isTodaySelected && !isLocked && (
              <div className="flex items-center gap-2 text-xs font-medium text-text-tertiary">
                {saving ? (
                  <><Loader2 size={12} className="animate-spin" /> Saving...</>
                ) : (
                  <><CheckCircle2 size={12} /> Saved</>
                )}
              </div>
            )}
            
            {isLocked ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-bg-surface border border-border-subtle rounded-md text-text-tertiary">
                <Lock size={12} /> Read-only
              </div>
            ) : (
              <Button size="sm" onClick={handleLock} className="h-8 text-xs px-3">
                <Lock size={12} className="mr-1.5" /> Lock Entry
              </Button>
            )}
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-2xl mx-auto h-full flex flex-col">
            <textarea
              value={content}
              onChange={(e) => saveDraft(e.target.value)}
              disabled={isLocked}
              placeholder={isLocked ? "" : "Start writing your reflection..."}
              className={`flex-1 w-full bg-transparent resize-none outline-none font-serif text-lg leading-relaxed ${
                isLocked ? "text-text-secondary cursor-default" : "text-text-primary"
              } placeholder:text-text-tertiary`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
