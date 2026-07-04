'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { toast } from 'sonner';

export type SessionType = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK' | 'STOPWATCH';
export type SessionStatus = 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';

export interface FocusSession {
  id: string;
  userId: number;
  taskId?: number;
  sessionType: SessionType;
  status: SessionStatus;
  plannedDurationSec?: number;
  accumulatedPauseSec: number;
  startedAt?: string;
  pausedAt?: string;
  endedAt?: string;
}

interface TimerContextType {
  activeSession: FocusSession | null;
  displaySeconds: number;
  isLoading: boolean;
  startSession: (type: SessionType, durationSec: number, taskId?: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  abandonSession: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

/**
 * Calculates the current display seconds based on server-authoritative state.
 * If running: elapsed = (now - startedAt) - accumulatedPause
 * If paused: elapsed = (pausedAt - startedAt) - accumulatedPause
 */
function calculateElapsed(session: FocusSession): number {
  if (!session.startedAt) return 0;
  
  const start = new Date(session.startedAt).getTime();
  let end = Date.now();
  
  if (session.status === 'PAUSED' && session.pausedAt) {
    end = new Date(session.pausedAt).getTime();
  } else if (session.status === 'COMPLETED' || session.status === 'ABANDONED') {
    if (session.endedAt) end = new Date(session.endedAt).getTime();
  }
  
  const elapsedMs = end - start;
  const elapsedSec = Math.floor(elapsedMs / 1000) - session.accumulatedPauseSec;
  return Math.max(0, elapsedSec);
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [displaySeconds, setDisplaySeconds] = useState(0);

  // Fetch active session from backend
  const { data: activeSession, isLoading } = useQuery<FocusSession | null>({
    queryKey: ['activeSession'],
    queryFn: async () => {
      const res = await fetchWithAuth('/v1/timer/sessions/active');
      if (res.status === 204) return null;
      if (!res.ok) throw new Error('Failed to fetch session');
      return res.json();
    },
    // Refetch when window regains focus to fix cross-tab drift
    refetchOnWindowFocus: true,
  });

  const startMutation = useMutation({
    mutationFn: async ({ type, duration, taskId }: { type: SessionType, duration: number, taskId?: number }) => {
      const res = await fetchWithAuth('/v1/timer/sessions', {
        method: 'POST',
        body: JSON.stringify({ sessionType: type, plannedDurationSec: duration, taskId }),
      });
      if (!res.ok) throw new Error('Failed to start session');
      return res.json();
    },
    onSuccess: (data) => queryClient.setQueryData(['activeSession'], data),
    onError: (err) => toast.error(err.message),
  });

  const pauseMutation = useMutation({
    mutationFn: async () => {
      if (!activeSession?.id) throw new Error('No active session');
      const res = await fetchWithAuth(`/v1/timer/sessions/${activeSession.id}/pause`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to pause');
      return res.json();
    },
    onSuccess: (data) => queryClient.setQueryData(['activeSession'], data),
  });

  const resumeMutation = useMutation({
    mutationFn: async () => {
      if (!activeSession?.id) throw new Error('No active session');
      const res = await fetchWithAuth(`/v1/timer/sessions/${activeSession.id}/resume`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to resume');
      return res.json();
    },
    onSuccess: (data) => queryClient.setQueryData(['activeSession'], data),
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!activeSession?.id) throw new Error('No active session');
      const res = await fetchWithAuth(`/v1/timer/sessions/${activeSession.id}/complete`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to complete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['activeSession'], null);
      queryClient.invalidateQueries({ queryKey: ['timerStats'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyReview'] });
      toast.success('Session completed!');
    },
  });

  const abandonMutation = useMutation({
    mutationFn: async () => {
      if (!activeSession?.id) throw new Error('No active session');
      const res = await fetchWithAuth(`/v1/timer/sessions/${activeSession.id}/abandon`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to abandon');
      return res.json();
    },
    onSuccess: () => queryClient.setQueryData(['activeSession'], null),
  });

  // Visual-only tick interval
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (!activeSession) {
      timeoutId = setTimeout(() => setDisplaySeconds(0), 0);
      return () => clearTimeout(timeoutId);
    }

    // Initial calculation
    timeoutId = setTimeout(() => setDisplaySeconds(calculateElapsed(activeSession)), 0);

    if (activeSession.status !== 'RUNNING') {
      return () => clearTimeout(timeoutId);
    }

    const interval = setInterval(() => {
      setDisplaySeconds(calculateElapsed(activeSession));
      
      // Auto-complete if it's a countdown and we reached the planned duration
      if (
        activeSession.plannedDurationSec &&
        activeSession.sessionType !== 'STOPWATCH'
      ) {
        const elapsed = calculateElapsed(activeSession);
        if (elapsed >= activeSession.plannedDurationSec) {
          completeMutation.mutate();
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [activeSession, completeMutation]);

  return (
    <TimerContext.Provider
      value={{
        activeSession: activeSession || null,
        displaySeconds,
        isLoading,
        startSession: (type, duration, taskId) => startMutation.mutate({ type, duration, taskId }),
        pauseSession: () => pauseMutation.mutate(),
        resumeSession: () => resumeMutation.mutate(),
        completeSession: () => completeMutation.mutate(),
        abandonSession: () => abandonMutation.mutate(),
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
