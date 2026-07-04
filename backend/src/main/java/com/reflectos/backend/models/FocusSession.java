package com.reflectos.backend.models;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "focus_sessions")
public class FocusSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    private SessionType sessionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    @Column(name = "planned_duration_sec")
    private Integer plannedDurationSec;

    @Column(name = "started_at", nullable = false)
    private ZonedDateTime startedAt;

    @Column(name = "paused_at")
    private ZonedDateTime pausedAt;

    @Column(name = "accumulated_pause_sec", nullable = false)
    private int accumulatedPauseSec = 0;

    @Column(name = "ended_at")
    private ZonedDateTime endedAt;

    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt;

    public enum SessionType {
        FOCUS, SHORT_BREAK, LONG_BREAK, STOPWATCH
    }

    public enum SessionStatus {
        RUNNING, PAUSED, COMPLETED, ABANDONED
    }

    public FocusSession() {
        this.createdAt = ZonedDateTime.now();
    }

    public FocusSession(User user, Task task, SessionType sessionType, SessionStatus status, Integer plannedDurationSec) {
        this.user = user;
        this.task = task;
        this.sessionType = sessionType;
        this.status = status;
        this.plannedDurationSec = plannedDurationSec;
        this.startedAt = ZonedDateTime.now();
        this.createdAt = ZonedDateTime.now();
        this.accumulatedPauseSec = 0;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    public SessionType getSessionType() { return sessionType; }
    public void setSessionType(SessionType sessionType) { this.sessionType = sessionType; }
    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }
    public Integer getPlannedDurationSec() { return plannedDurationSec; }
    public void setPlannedDurationSec(Integer plannedDurationSec) { this.plannedDurationSec = plannedDurationSec; }
    public ZonedDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(ZonedDateTime startedAt) { this.startedAt = startedAt; }
    public ZonedDateTime getPausedAt() { return pausedAt; }
    public void setPausedAt(ZonedDateTime pausedAt) { this.pausedAt = pausedAt; }
    public int getAccumulatedPauseSec() { return accumulatedPauseSec; }
    public void setAccumulatedPauseSec(int accumulatedPauseSec) { this.accumulatedPauseSec = accumulatedPauseSec; }
    public ZonedDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(ZonedDateTime endedAt) { this.endedAt = endedAt; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
