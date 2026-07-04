-- V5__task_templates.sql
-- Recurring tasks: a template row defines the recurrence pattern.
-- A daily @Scheduled job materializes actual task instances from templates.

CREATE TABLE task_templates (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    priority VARCHAR(255) DEFAULT 'medium',
    category VARCHAR(255) DEFAULT 'General',
    recurrence_type VARCHAR(50) NOT NULL,   -- DAILY, WEEKLY, WEEKDAYS (Mon-Fri)
    recurrence_days VARCHAR(255),            -- comma-separated day numbers for WEEKLY (1=Mon..7=Sun)
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP,
    CONSTRAINT fk_task_templates_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Track which dates a template has already been materialized for
ALTER TABLE tasks ADD COLUMN template_id BIGINT;
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_template FOREIGN KEY (template_id) REFERENCES task_templates (id) ON DELETE SET NULL;
