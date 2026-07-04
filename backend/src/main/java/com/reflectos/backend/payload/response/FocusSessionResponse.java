package com.reflectos.backend.payload.response;

import com.reflectos.backend.models.FocusSession;

import java.time.ZonedDateTime;
import java.util.UUID;

public class FocusSessionResponse {
    private UUID id;
    private Long taskId;
    private FocusSession.SessionType sessionType;
    private FocusSession.SessionStatus status;
    private Integer plannedDurationSec;
    private ZonedDateTime startedAt;
    private ZonedDateTime pausedAt;
    private int accumulatedPauseSec;
    private ZonedDateTime endedAt;

    public FocusSessionResponse(FocusSession session) {
        this.id = session.getId();
        this.taskId = session.getTask() != null ? session.getTask().getId() : null;
        this.sessionType = session.getSessionType();
        this.status = session.getStatus();
        this.plannedDurationSec = session.getPlannedDurationSec();
        this.startedAt = session.getStartedAt();
        this.pausedAt = session.getPausedAt();
        this.accumulatedPauseSec = session.getAccumulatedPauseSec();
        this.endedAt = session.getEndedAt();
    }

    public UUID getId() { return id; }
    public Long getTaskId() { return taskId; }
    public FocusSession.SessionType getSessionType() { return sessionType; }
    public FocusSession.SessionStatus getStatus() { return status; }
    public Integer getPlannedDurationSec() { return plannedDurationSec; }
    public ZonedDateTime getStartedAt() { return startedAt; }
    public ZonedDateTime getPausedAt() { return pausedAt; }
    public int getAccumulatedPauseSec() { return accumulatedPauseSec; }
    public ZonedDateTime getEndedAt() { return endedAt; }
}
