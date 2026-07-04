-- V8__idempotency_keys.sql
-- Idempotency pattern: stores the Idempotency-Key header value and the resulting response
-- so retried requests can return the same response without duplicating the backend operation.

CREATE TABLE idempotency_keys (
    idempotency_key VARCHAR(255) PRIMARY KEY,
    response_body TEXT,
    response_status INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Note: In a production system, you would have a cron job or table TTL to clean up old keys (e.g. after 24h).
