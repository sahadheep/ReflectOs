'use client';

import { useTimer } from '@/context/TimerContext';
import { Button } from './ui/button';
import { Play, Pause, Square, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function TimerDock() {
  const { activeSession, displaySeconds, pauseSession, resumeSession, abandonSession } = useTimer();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!activeSession) return null;

  const isRunning = activeSession.status === 'RUNNING';
  
  let timeLeft = displaySeconds;
  if (activeSession.plannedDurationSec && activeSession.sessionType !== 'STOPWATCH') {
    timeLeft = Math.max(0, activeSession.plannedDurationSec - displaySeconds);
  }

  const typeLabel = activeSession.sessionType.replace('_', ' ');

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 bg-bg-surface border border-border rounded-lg shadow-lg overflow-hidden transition-all duration-200 ease-out",
      isCollapsed ? "w-32" : "w-64"
    )}>
      <div className="flex items-center justify-between p-2 bg-bg-base/50 border-b border-border/50">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider truncate">
          {typeLabel}
        </span>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      
      <div className="p-4 flex flex-col items-center">
        <div className={cn(
          "font-mono font-bold tracking-tight text-mint transition-all duration-200",
          isCollapsed ? "text-xl" : "text-4xl mb-4"
        )}>
          {formatTime(timeLeft)}
        </div>
        
        {!isCollapsed && (
          <div className="flex items-center justify-center gap-2">
            {isRunning ? (
              <Button size="icon" variant="outline" onClick={pauseSession} title="Pause">
                <Pause size={18} />
              </Button>
            ) : (
              <Button size="icon" variant="default" onClick={resumeSession} title="Resume">
                <Play size={18} />
              </Button>
            )}
            <Button size="icon" variant="destructive" onClick={abandonSession} title="Stop & Abandon">
              <Square size={18} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
