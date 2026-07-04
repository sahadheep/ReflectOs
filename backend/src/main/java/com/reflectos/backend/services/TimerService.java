package com.reflectos.backend.services;

import com.reflectos.backend.models.FocusSession;
import com.reflectos.backend.models.Task;
import com.reflectos.backend.models.User;
import com.reflectos.backend.models.UserPreferences;
import com.reflectos.backend.payload.request.FocusSessionRequest;
import com.reflectos.backend.repositories.FocusSessionRepository;
import com.reflectos.backend.repositories.TaskRepository;
import com.reflectos.backend.repositories.UserPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Service
public class TimerService {

    @Autowired
    private FocusSessionRepository focusSessionRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserPreferencesRepository userPreferencesRepository;

    @Transactional
    public FocusSession startSession(User user, FocusSessionRequest request) {
        // Check if user already has a RUNNING or PAUSED session
        Optional<FocusSession> activeSession = focusSessionRepository.findFirstByUserAndStatusInOrderByStartedAtDesc(
                user, Arrays.asList(FocusSession.SessionStatus.RUNNING, FocusSession.SessionStatus.PAUSED));

        if (activeSession.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already has an active session");
        }

        Task task = null;
        if (request.getTaskId() != null) {
            task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
            if (!task.getUser().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this task");
            }
        }

        Integer duration = request.getPlannedDurationSec();
        if (duration == null && request.getSessionType() != FocusSession.SessionType.STOPWATCH) {
            UserPreferences prefs = getPreferences(user);
            duration = switch (request.getSessionType()) {
                case FOCUS -> prefs.getFocusDurationSec();
                case SHORT_BREAK -> prefs.getShortBreakSec();
                case LONG_BREAK -> prefs.getLongBreakSec();
                default -> 1500;
            };
        }

        FocusSession session = new FocusSession(user, task, request.getSessionType(), FocusSession.SessionStatus.RUNNING, duration);
        return focusSessionRepository.save(session);
    }

    @Transactional
    public FocusSession pauseSession(User user, UUID sessionId) {
        FocusSession session = getSessionForUser(user, sessionId);
        if (session.getStatus() != FocusSession.SessionStatus.RUNNING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Session is not running");
        }
        session.setStatus(FocusSession.SessionStatus.PAUSED);
        session.setPausedAt(ZonedDateTime.now());
        return focusSessionRepository.save(session);
    }

    @Transactional
    public FocusSession resumeSession(User user, UUID sessionId) {
        FocusSession session = getSessionForUser(user, sessionId);
        if (session.getStatus() != FocusSession.SessionStatus.PAUSED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Session is not paused");
        }
        ZonedDateTime now = ZonedDateTime.now();
        if (session.getPausedAt() != null) {
            long pauseDuration = Duration.between(session.getPausedAt(), now).getSeconds();
            session.setAccumulatedPauseSec(session.getAccumulatedPauseSec() + (int) pauseDuration);
        }
        session.setStatus(FocusSession.SessionStatus.RUNNING);
        session.setPausedAt(null);
        return focusSessionRepository.save(session);
    }

    @Transactional
    public FocusSession completeSession(User user, UUID sessionId) {
        FocusSession session = getSessionForUser(user, sessionId);
        if (session.getStatus() == FocusSession.SessionStatus.COMPLETED || session.getStatus() == FocusSession.SessionStatus.ABANDONED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Session already ended");
        }
        session.setStatus(FocusSession.SessionStatus.COMPLETED);
        session.setEndedAt(ZonedDateTime.now());
        return focusSessionRepository.save(session);
    }

    @Transactional
    public FocusSession abandonSession(User user, UUID sessionId) {
        FocusSession session = getSessionForUser(user, sessionId);
        if (session.getStatus() == FocusSession.SessionStatus.COMPLETED || session.getStatus() == FocusSession.SessionStatus.ABANDONED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Session already ended");
        }
        session.setStatus(FocusSession.SessionStatus.ABANDONED);
        session.setEndedAt(ZonedDateTime.now());
        return focusSessionRepository.save(session);
    }

    public Optional<FocusSession> getActiveSession(User user) {
        return focusSessionRepository.findFirstByUserAndStatusInOrderByStartedAtDesc(
                user, Arrays.asList(FocusSession.SessionStatus.RUNNING, FocusSession.SessionStatus.PAUSED));
    }

    public UserPreferences getPreferences(User user) {
        return userPreferencesRepository.findById(user.getId())
                .orElseGet(() -> userPreferencesRepository.save(new UserPreferences(user)));
    }

    @Transactional
    public UserPreferences updatePreferences(User user, UserPreferences newPrefs) {
        UserPreferences prefs = getPreferences(user);
        prefs.setFocusDurationSec(newPrefs.getFocusDurationSec());
        prefs.setShortBreakSec(newPrefs.getShortBreakSec());
        prefs.setLongBreakSec(newPrefs.getLongBreakSec());
        prefs.setSessionsBeforeLongBreak(newPrefs.getSessionsBeforeLongBreak());
        prefs.setAutoStartNext(newPrefs.isAutoStartNext());
        prefs.setSoundEnabled(newPrefs.isSoundEnabled());
        return userPreferencesRepository.save(prefs);
    }

    private FocusSession getSessionForUser(User user, UUID sessionId) {
        FocusSession session = focusSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
        if (!session.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this session");
        }
        return session;
    }
}
