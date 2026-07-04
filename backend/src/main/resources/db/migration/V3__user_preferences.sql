-- V3__user_preferences.sql
CREATE TABLE user_preferences (
    user_id BIGINT PRIMARY KEY,
    focus_duration_sec INTEGER NOT NULL DEFAULT 1500,
    short_break_sec INTEGER NOT NULL DEFAULT 300,
    long_break_sec INTEGER NOT NULL DEFAULT 900,
    sessions_before_long_break INTEGER NOT NULL DEFAULT 4,
    auto_start_next BOOLEAN NOT NULL DEFAULT false,
    sound_enabled BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
