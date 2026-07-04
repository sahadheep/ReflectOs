-- V6__outbox.sql
-- Outbox pattern: events are written to this table in the same transaction
-- as the domain write. A poller then publishes them, guaranteeing
-- at-least-once delivery even if the app crashes between commit and publish.

CREATE TABLE outbox_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,      -- e.g. TASK_DUE, DAILY_DIGEST
    payload TEXT NOT NULL,                  -- JSON payload
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',  -- PENDING, PUBLISHED, FAILED
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER NOT NULL DEFAULT 0
);
