'use client';

import { useTimer } from '@/context/TimerContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function FocusPage() {
  const { activeSession, displaySeconds, startSession, pauseSession, resumeSession, abandonSession } = useTimer();
  const [sessionType, setSessionType] = useState<'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'>('FOCUS');
  const [durationSec, setDurationSec] = useState(1500); // 25 min default

  const isRunning = activeSession?.status === 'RUNNING';
  
  let timeLeft = displaySeconds;
  let progress = 0;

  if (activeSession) {
    if (activeSession.plannedDurationSec && activeSession.sessionType !== 'STOPWATCH') {
      timeLeft = Math.max(0, activeSession.plannedDurationSec - displaySeconds);
      progress = Math.min(100, (displaySeconds / activeSession.plannedDurationSec) * 100);
    } else {
      progress = 100; // Stopwatch Mode
    }
  } else {
    timeLeft = durationSec;
  }

  // Calculate SVG strokeDashoffset
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center pt-10">
      <h1 className="text-3xl font-serif text-text-primary mb-8">Focus</h1>

      {!activeSession && (
        <div className="flex gap-4 mb-12">
          <Button 
            variant={sessionType === 'FOCUS' ? 'default' : 'outline'} 
            onClick={() => { setSessionType('FOCUS'); setDurationSec(1500); }}
          >
            Pomodoro (25m)
          </Button>
          <Button 
            variant={sessionType === 'SHORT_BREAK' ? 'default' : 'outline'} 
            onClick={() => { setSessionType('SHORT_BREAK'); setDurationSec(300); }}
          >
            Short Break (5m)
          </Button>
          <Button 
            variant={sessionType === 'LONG_BREAK' ? 'default' : 'outline'} 
            onClick={() => { setSessionType('LONG_BREAK'); setDurationSec(900); }}
          >
            Long Break (15m)
          </Button>
        </div>
      )}

      {/* Circular Timer Ring */}
      <div className="relative flex items-center justify-center mb-12">
        <svg width="320" height="320" className="rotate-[-90deg]">
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-border/30"
          />
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000 ease-linear",
              activeSession ? "text-mint" : "text-border"
            )}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "text-6xl font-mono font-bold tracking-tighter transition-colors",
            activeSession ? "text-mint" : "text-text-primary"
          )}>
            {formatTime(timeLeft)}
          </span>
          {activeSession && (
            <span className="mt-2 text-sm text-text-muted uppercase tracking-widest font-semibold">
              {activeSession.sessionType.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {!activeSession ? (
          <Button size="lg" className="w-32 text-lg rounded-full h-14" onClick={() => startSession(sessionType, durationSec)}>
            <Play className="mr-2" size={20} />
            Start
          </Button>
        ) : (
          <>
            {isRunning ? (
              <Button size="lg" variant="outline" className="w-32 text-lg rounded-full h-14 border-2" onClick={pauseSession}>
                <Pause className="mr-2" size={20} />
                Pause
              </Button>
            ) : (
              <Button size="lg" className="w-32 text-lg rounded-full h-14" onClick={resumeSession}>
                <Play className="mr-2" size={20} />
                Resume
              </Button>
            )}
            <Button size="lg" variant="destructive" className="w-32 text-lg rounded-full h-14" onClick={abandonSession}>
              <Square className="mr-2" size={20} />
              Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
