package com.reflectos.backend.payload.response;

public class TimerStatsResponse {
    private long totalFocusSeconds;
    private int sessionCount;


    public TimerStatsResponse() {}

    public TimerStatsResponse(long totalFocusSeconds, int sessionCount) {
        this.totalFocusSeconds = totalFocusSeconds;
        this.sessionCount = sessionCount;
    }

    public long getTotalFocusSeconds() { return totalFocusSeconds; }
    public void setTotalFocusSeconds(long totalFocusSeconds) { this.totalFocusSeconds = totalFocusSeconds; }
    public int getSessionCount() { return sessionCount; }
    public void setSessionCount(int sessionCount) { this.sessionCount = sessionCount; }
}
