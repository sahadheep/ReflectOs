-- V1__baseline.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    created_at TIMESTAMP,
    streak INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    priority VARCHAR(255) DEFAULT 'medium',
    category VARCHAR(255) DEFAULT 'General',
    target_date DATE,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP,
    is_top_priority BOOLEAN DEFAULT false,
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE diary_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    mood VARCHAR(255),
    content_draft TEXT,
    content_submitted TEXT,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP,
    CONSTRAINT uk_diary_user_date UNIQUE (user_id, date),
    CONSTRAINT fk_diary_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
