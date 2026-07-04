package com.reflectos.backend.controllers;

import com.reflectos.backend.models.FocusSession;
import com.reflectos.backend.models.User;
import com.reflectos.backend.models.UserPreferences;
import com.reflectos.backend.payload.request.FocusSessionRequest;
import com.reflectos.backend.payload.response.FocusSessionResponse;
import com.reflectos.backend.payload.response.TimerStatsResponse;
import com.reflectos.backend.payload.response.UserPreferencesDto;
import com.reflectos.backend.repositories.FocusSessionRepository;
import com.reflectos.backend.services.TimerService;
import com.reflectos.backend.services.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

/**
 * REST controller for the Focus Timer feature.
 *
 * All timer state is server-authoritative: the frontend derives its
 * countdown display from {@code started_at + accumulated_pause_sec}
 * stored here, never from a client-side interval. This design means
 * a page refresh or a second browser tab always sees the true timer
 * state within ~1 second.
 *
 * Design patterns:
 * - Repository (Spring Data JPA for persistence)
 * - State Machine (TimerService enforces valid transitions)
 */
@RestController
@RequestMapping("/api/v1/timer")
public class TimerController {

    @Autowired
    private TimerService timerService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private FocusSessionRepository focusSessionRepository;

    // ─── Session lifecycle ───────────────────────────────────────

    /**
     * Start a new focus/break/stopwatch session.
     * Returns 409 if the user already has an active session.
     */
    @PostMapping("/sessions")
    public ResponseEntity<FocusSessionResponse> startSession(@RequestBody FocusSessionRequest request) {
        User user = taskService.getCurrentUser();
        FocusSession session = timerService.startSession(user, request);
        return ResponseEntity.ok(new FocusSessionResponse(session));
    }

    @PatchMapping("/sessions/{id}/pause")
    public ResponseEntity<FocusSessionResponse> pauseSession(@PathVariable UUID id) {
        User user = taskService.getCurrentUser();
        FocusSession session = timerService.pauseSession(user, id);
        return ResponseEntity.ok(new FocusSessionResponse(session));
    }

    @PatchMapping("/sessions/{id}/resume")
    public ResponseEntity<FocusSessionResponse> resumeSession(@PathVariable UUID id) {
        User user = taskService.getCurrentUser();
        FocusSession session = timerService.resumeSession(user, id);
        return ResponseEntity.ok(new FocusSessionResponse(session));
    }

    @PatchMapping("/sessions/{id}/complete")
    public ResponseEntity<FocusSessionResponse> completeSession(@PathVariable UUID id) {
        User user = taskService.getCurrentUser();
        FocusSession session = timerService.completeSession(user, id);
        return ResponseEntity.ok(new FocusSessionResponse(session));
    }

    @PatchMapping("/sessions/{id}/abandon")
    public ResponseEntity<FocusSessionResponse> abandonSession(@PathVariable UUID id) {
        User user = taskService.getCurrentUser();
        FocusSession session = timerService.abandonSession(user, id);
        return ResponseEntity.ok(new FocusSessionResponse(session));
    }

    // ─── Queries ─────────────────────────────────────────────────

    /**
     * Returns the user's currently active (RUNNING or PAUSED) session,
     * or 204 No Content if none. The frontend calls this on app load
     * and on tab refocus to rehydrate a surviving timer.
     */
    @GetMapping("/sessions/active")
    public ResponseEntity<FocusSessionResponse> getActiveSession() {
        User user = taskService.getCurrentUser();
        Optional<FocusSession> session = timerService.getActiveSession(user);
        return session.map(s -> ResponseEntity.ok(new FocusSessionResponse(s)))
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/sessions/history")
    public ResponseEntity<Page<FocusSessionResponse>> getSessionHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = taskService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<FocusSession> sessions = focusSessionRepository.findByUserOrderByStartedAtDesc(user, pageable);
        Page<FocusSessionResponse> response = sessions.map(FocusSessionResponse::new);
        return ResponseEntity.ok(response);
    }

    /**
     * Aggregated timer stats: total focus seconds, session count,
     * and current streak (consecutive days with ≥1 completed focus session).
     */
    @GetMapping("/stats")
    @org.springframework.cache.annotation.Cacheable(value = "timerStats", key = "#user.id + '-' + #range", condition = "#range != 'today'")
    public ResponseEntity<TimerStatsResponse> getStats(@RequestParam(defaultValue = "today") String range) {
        User user = taskService.getCurrentUser();
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime from;

        switch (range) {
            case "week":
                from = now.with(DayOfWeek.MONDAY).toLocalDate().atStartOfDay(now.getZone());
                break;
            case "month":
                from = now.withDayOfMonth(1).toLocalDate().atStartOfDay(now.getZone());
                break;
            case "today":
            default:
                from = now.toLocalDate().atStartOfDay(now.getZone());
                break;
        }

        List<FocusSession> sessions = focusSessionRepository.findByUserAndDateRange(user, from, now);

        long totalFocusSeconds = sessions.stream()
                .filter(s -> s.getSessionType() == FocusSession.SessionType.FOCUS
                        && s.getStatus() == FocusSession.SessionStatus.COMPLETED)
                .mapToLong(s -> {
                    if (s.getEndedAt() != null && s.getStartedAt() != null) {
                        return Duration.between(s.getStartedAt(), s.getEndedAt()).getSeconds() - s.getAccumulatedPauseSec();
                    }
                    return 0;
                })
                .sum();

        int sessionCount = (int) sessions.stream()
                .filter(s -> s.getSessionType() == FocusSession.SessionType.FOCUS
                        && s.getStatus() == FocusSession.SessionStatus.COMPLETED)
                .count();

        // Streak: count consecutive days going backward from today
        int streak = calculateStreak(user, now);

        return ResponseEntity.ok(new TimerStatsResponse(totalFocusSeconds, sessionCount, streak));
    }

    // ─── Preferences ─────────────────────────────────────────────

    @GetMapping("/preferences")
    public ResponseEntity<UserPreferencesDto> getPreferences() {
        User user = taskService.getCurrentUser();
        UserPreferences prefs = timerService.getPreferences(user);
        return ResponseEntity.ok(new UserPreferencesDto(prefs));
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserPreferencesDto> updatePreferences(@RequestBody UserPreferencesDto dto) {
        User user = taskService.getCurrentUser();
        UserPreferences prefs = timerService.getPreferences(user);
        prefs.setFocusDurationSec(dto.getFocusDurationSec());
        prefs.setShortBreakSec(dto.getShortBreakSec());
        prefs.setLongBreakSec(dto.getLongBreakSec());
        prefs.setSessionsBeforeLongBreak(dto.getSessionsBeforeLongBreak());
        prefs.setAutoStartNext(dto.isAutoStartNext());
        prefs.setSoundEnabled(dto.isSoundEnabled());
        UserPreferences updated = timerService.updatePreferences(user, prefs);
        return ResponseEntity.ok(new UserPreferencesDto(updated));
    }

    // ─── Internals ───────────────────────────────────────────────

    private int calculateStreak(User user, ZonedDateTime now) {
        int streak = 0;
        LocalDate day = now.toLocalDate();

        for (int i = 0; i < 365; i++) {
            ZonedDateTime dayStart = day.atStartOfDay(now.getZone());
            ZonedDateTime dayEnd = day.plusDays(1).atStartOfDay(now.getZone());

            List<FocusSession> daySessions = focusSessionRepository.findByUserAndDateRange(user, dayStart, dayEnd);
            boolean hasCompleted = daySessions.stream()
                    .anyMatch(s -> s.getSessionType() == FocusSession.SessionType.FOCUS
                            && s.getStatus() == FocusSession.SessionStatus.COMPLETED);

            if (hasCompleted) {
                streak++;
                day = day.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }
}
