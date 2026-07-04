package com.reflectos.backend.payload.response;

public class TimerStatsResponse {
    private long totalFocusSeconds;
    private int sessionCount;
    private int currentStreak;

    public TimerStatsResponse() {}

    public TimerStatsResponse(long totalFocusSeconds, int sessionCount, int currentStreak) {
        this.totalFocusSeconds = totalFocusSeconds;
        this.sessionCount = sessionCount;
        this.currentStreak = currentStreak;
    }

    public long getTotalFocusSeconds() { return totalFocusSeconds; }
    public void setTotalFocusSeconds(long totalFocusSeconds) { this.totalFocusSeconds = totalFocusSeconds; }
    public int getSessionCount() { return sessionCount; }
    public void setSessionCount(int sessionCount) { this.sessionCount = sessionCount; }
    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }
}
