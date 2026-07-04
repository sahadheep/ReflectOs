package com.reflectos.backend.services;

import com.reflectos.backend.models.FocusSession;
import com.reflectos.backend.repositories.FocusSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Service
public class TimerSchedulerService {

    @Autowired
    private FocusSessionRepository focusSessionRepository;

    // Run every minute
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void abandonStaleSessions() {
        // Cutoff is 1 hour ago for running/paused sessions as a grace period
        // For a more precise check, we could check if started_at + planned_duration + 5 mins < now
        // But since users might pause for a long time, let's auto-abandon if untouched for 4 hours
        ZonedDateTime cutoff = ZonedDateTime.now().minusHours(4);
        List<FocusSession> staleSessions = focusSessionRepository.findStaleSessions(cutoff);
        
        for (FocusSession session : staleSessions) {
            session.setStatus(FocusSession.SessionStatus.ABANDONED);
            session.setEndedAt(ZonedDateTime.now());
        }
        
        if (!staleSessions.isEmpty()) {
            focusSessionRepository.saveAll(staleSessions);
        }
    }
}
