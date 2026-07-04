-- V2__focus_sessions.sql
CREATE TABLE focus_sessions (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL,
    task_id BIGINT,
    session_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    planned_duration_sec INTEGER,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    paused_at TIMESTAMP WITH TIME ZONE,
    accumulated_pause_sec INTEGER NOT NULL DEFAULT 0,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_focus_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_focus_sessions_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE SET NULL
);
