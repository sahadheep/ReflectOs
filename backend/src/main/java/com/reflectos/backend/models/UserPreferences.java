package com.reflectos.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_preferences")
public class UserPreferences {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "focus_duration_sec", nullable = false)
    private int focusDurationSec = 1500;

    @Column(name = "short_break_sec", nullable = false)
    private int shortBreakSec = 300;

    @Column(name = "long_break_sec", nullable = false)
    private int longBreakSec = 900;

    @Column(name = "sessions_before_long_break", nullable = false)
    private int sessionsBeforeLongBreak = 4;

    @Column(name = "auto_start_next", nullable = false)
    private boolean autoStartNext = false;

    @Column(name = "sound_enabled", nullable = false)
    private boolean soundEnabled = true;

    public UserPreferences() {}

    public UserPreferences(User user) {
        this.user = user;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public int getFocusDurationSec() {
        return focusDurationSec;
    }

    public void setFocusDurationSec(int focusDurationSec) {
        this.focusDurationSec = focusDurationSec;
    }

    public int getShortBreakSec() {
        return shortBreakSec;
    }

    public void setShortBreakSec(int shortBreakSec) {
        this.shortBreakSec = shortBreakSec;
    }

    public int getLongBreakSec() {
        return longBreakSec;
    }

    public void setLongBreakSec(int longBreakSec) {
        this.longBreakSec = longBreakSec;
    }

    public int getSessionsBeforeLongBreak() {
        return sessionsBeforeLongBreak;
    }

    public void setSessionsBeforeLongBreak(int sessionsBeforeLongBreak) {
        this.sessionsBeforeLongBreak = sessionsBeforeLongBreak;
    }

    public boolean isAutoStartNext() {
        return autoStartNext;
    }

    public void setAutoStartNext(boolean autoStartNext) {
        this.autoStartNext = autoStartNext;
    }

    public boolean isSoundEnabled() {
        return soundEnabled;
    }

    public void setSoundEnabled(boolean soundEnabled) {
        this.soundEnabled = soundEnabled;
    }
}
