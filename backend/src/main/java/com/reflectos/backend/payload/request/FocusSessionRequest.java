package com.reflectos.backend.payload.request;

import com.reflectos.backend.models.FocusSession.SessionType;

public class FocusSessionRequest {
    private Long taskId;
    private SessionType sessionType;
    private Integer plannedDurationSec;

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public SessionType getSessionType() {
        return sessionType;
    }

    public void setSessionType(SessionType sessionType) {
        this.sessionType = sessionType;
    }

    public Integer getPlannedDurationSec() {
        return plannedDurationSec;
    }

    public void setPlannedDurationSec(Integer plannedDurationSec) {
        this.plannedDurationSec = plannedDurationSec;
    }
}
