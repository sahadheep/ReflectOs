package com.reflectos.backend.payload.response;

import com.reflectos.backend.models.UserPreferences;

public class UserPreferencesDto {
    private int focusDurationSec;
    private int shortBreakSec;
    private int longBreakSec;
    private int sessionsBeforeLongBreak;
    private boolean autoStartNext;
    private boolean soundEnabled;

    public UserPreferencesDto() {}

    public UserPreferencesDto(UserPreferences prefs) {
        this.focusDurationSec = prefs.getFocusDurationSec();
        this.shortBreakSec = prefs.getShortBreakSec();
        this.longBreakSec = prefs.getLongBreakSec();
        this.sessionsBeforeLongBreak = prefs.getSessionsBeforeLongBreak();
        this.autoStartNext = prefs.isAutoStartNext();
        this.soundEnabled = prefs.isSoundEnabled();
    }

    public int getFocusDurationSec() { return focusDurationSec; }
    public void setFocusDurationSec(int focusDurationSec) { this.focusDurationSec = focusDurationSec; }
    public int getShortBreakSec() { return shortBreakSec; }
    public void setShortBreakSec(int shortBreakSec) { this.shortBreakSec = shortBreakSec; }
    public int getLongBreakSec() { return longBreakSec; }
    public void setLongBreakSec(int longBreakSec) { this.longBreakSec = longBreakSec; }
    public int getSessionsBeforeLongBreak() { return sessionsBeforeLongBreak; }
    public void setSessionsBeforeLongBreak(int sessionsBeforeLongBreak) { this.sessionsBeforeLongBreak = sessionsBeforeLongBreak; }
    public boolean isAutoStartNext() { return autoStartNext; }
    public void setAutoStartNext(boolean autoStartNext) { this.autoStartNext = autoStartNext; }
    public boolean isSoundEnabled() { return soundEnabled; }
    public void setSoundEnabled(boolean soundEnabled) { this.soundEnabled = soundEnabled; }
}
