"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";
import { format, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Lock,
  Unlock,
  Save,
  Send,
  BookOpen,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface DiaryEntry {
  id: number;
  date: string;
  mood: string;
  contentDraft: string;
  contentSubmitted: string;
  locked: boolean;
}

const MOODS = [
  { emoji: "😀", label: "Great", value: "great" },
  { emoji: "🙂", label: "Good", value: "good" },
  { emoji: "😐", label: "Normal", value: "normal" },
  { emoji: "😔", label: "Sad", value: "sad" },
  { emoji: "😫", label: "Exhausted", value: "exhausted" },
  { emoji: "😡", label: "Frustrated", value: "frustrated" },
];

const DEFAULT_TEMPLATE = `# Today's Reflection

**What was the highlight of your day?**

...

**What challenged you today?**

...

**What's one thing you're grateful for?**

...

**What did you learn today?**

...
`;

export default function DiaryPage() {
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [content, setContent] = useState(DEFAULT_TEMPLATE);
  const [mood, setMood] = useState("😐");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isLockedByTime, setIsLockedByTime] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    setWordCount(
      content
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length,
    );
  }, [content]);

  const loadTodayEntry = useCallback(async () => {
    setError(false);
    try {
      const res = await fetchWithAuth(`/diary/today?date=${todayStr}`);
      if (res.ok) {
        const data: DiaryEntry = await res.json();
        setEntry(data);
        if (data.locked) {
          setContent(data.contentSubmitted || "");
          setMood(data.mood || "😐");
        } else {
          setContent(data.contentDraft || DEFAULT_TEMPLATE);
          setMood(data.mood || "😐");
        }
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    const currentHour = new Date().getHours();
    setIsLockedByTime(currentHour < 22);
    loadTodayEntry();
  }, [loadTodayEntry]);

  const handleSaveDraft = async () => {
    if (entry?.locked || isLockedByTime) return;
    setSaving(true);
    try {
      const res = await fetchWithAuth(`/diary/draft?date=${todayStr}`, {
        method: "POST",
        body: JSON.stringify({ mood, content }),
      });
      if (res.ok) {
        setLastSaved(new Date());
        toast.success("Draft saved");
      } else {
        toast.error("Failed to save draft");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (entry?.locked || isLockedByTime) return;
    if (
      !confirm(
        "Are you sure you want to submit? This will lock the entry forever.",
      )
    )
      return;

    try {
      const res = await fetchWithAuth(`/diary/submit?date=${todayStr}`, {
        method: "POST",
        body: JSON.stringify({ mood, content }),
      });
      if (res.ok) {
        loadTodayEntry();
        toast.success("Diary locked for today!");
      } else {
        toast.error("Failed to lock diary");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to lock diary");
    }
  };

  if (loading) return <LoadingScreen message="Loading your diary..." />;
  if (error)
    return <ErrorState title="Couldn't load diary" onRetry={loadTodayEntry} />;

  const isEntryLocked = entry?.locked;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`h-screen overflow-hidden flex flex-col ${focusMode ? "bg-background" : ""}`}
    >
      {/* Header */}
      {!focusMode && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="border-b border-border/20 p-6 space-y-4 bg-card/60 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Daily Reflection</h1>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), "EEEE, MMMM do")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isEntryLocked ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center text-primary bg-primary/10 px-4 py-2 rounded-lg text-sm font-medium border border-primary/20 gap-2"
                >
                  <Lock size={16} /> Completed
                </motion.div>
              ) : isLockedByTime ? (
                <div className="flex items-center text-warning bg-warning/10 px-4 py-2 rounded-lg text-sm font-medium border border-warning/20 gap-2">
                  <Lock size={16} /> Unlocks at 10 PM
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center text-success bg-success/10 px-4 py-2 rounded-lg text-sm font-medium border border-success/20 gap-2"
                >
                  <Unlock size={16} /> Ready to Write
                </motion.div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFocusMode(!focusMode)}
                className="gap-2"
              >
                <Sparkles size={16} /> Focus
              </Button>
            </div>
          </div>

          {/* Mood selector */}
          {!isEntryLocked && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm font-medium text-muted-foreground">
                How are you feeling?
              </span>
              <div className="flex gap-2">
                {MOODS.map((m) => (
                  <motion.button
                    key={m.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMood(m.emoji)}
                    className={`text-2xl p-2 rounded-lg transition-all ${
                      mood === m.emoji
                        ? "bg-primary/20 border border-primary/40"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                    title={m.label}
                  >
                    {m.emoji}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isLockedByTime && !isEntryLocked ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center p-8"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
              >
                <Lock size={32} className="text-primary/30" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Live your day first</h2>
                <p className="text-muted-foreground mt-2">
                  Your diary will unlock at 10:00 PM
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Editor */}
            <div className="flex-1 overflow-hidden p-6">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleSaveDraft}
                disabled={isEntryLocked}
                className="w-full h-full resize-none bg-card/40 backdrop-blur-md border border-border/30 rounded-xl text-base leading-relaxed focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all p-6 shadow-soft"
                placeholder="Start writing..."
              />
            </div>

            {/* Footer */}
            {!isEntryLocked && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="border-t border-border/20 p-6 space-y-4 bg-background/50 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {lastSaved && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-muted-foreground flex items-center gap-2"
                      >
                        <Save size={14} />
                        Draft saved at {format(lastSaved, "HH:mm")}
                      </motion.div>
                    )}
                    {saving && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-xs text-primary"
                      >
                        Saving...
                      </motion.div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {wordCount} words
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="gap-2"
                  >
                    <Save size={16} /> Save Draft
                  </Button>
                  <Button onClick={handleSubmit} className="gap-2">
                    <Send size={16} /> Submit & Lock
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
