package com.reflectos.backend.controllers;

import com.reflectos.backend.models.DiaryEntry;
import com.reflectos.backend.models.FocusSession;
import com.reflectos.backend.models.Task;
import com.reflectos.backend.models.User;
import com.reflectos.backend.repositories.DiaryEntryRepository;
import com.reflectos.backend.repositories.FocusSessionRepository;
import com.reflectos.backend.repositories.TaskRepository;
import com.reflectos.backend.services.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

/**
 * Aggregates data for the past 7 days into a single response.
 * This read-optimized endpoint avoids multiple frontend fetches and joins
 * data server-side.
 */
@RestController
@RequestMapping("/api/v1/analytics")
public class WeeklyReviewController {

    private final TaskService taskService;
    private final TaskRepository taskRepository;
    private final DiaryEntryRepository diaryRepository;
    private final FocusSessionRepository focusSessionRepository;

    public WeeklyReviewController(TaskService taskService,
                                  TaskRepository taskRepository,
                                  DiaryEntryRepository diaryRepository,
                                  FocusSessionRepository focusSessionRepository) {
        this.taskService = taskService;
        this.taskRepository = taskRepository;
        this.diaryRepository = diaryRepository;
        this.focusSessionRepository = focusSessionRepository;
    }

    @GetMapping("/weekly-review")
    @org.springframework.cache.annotation.Cacheable(value = "weeklyReview", key = "#user.id")
    public ResponseEntity<Map<String, Object>> getWeeklyReview() {
        User user = taskService.getCurrentUser();
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(7);
        
        ZonedDateTime startZoned = sevenDaysAgo.atStartOfDay(ZoneId.systemDefault());
        ZonedDateTime endZoned = today.plusDays(1).atStartOfDay(ZoneId.systemDefault());

        List<Task> tasks = taskRepository.findByUserAndTargetDateBetween(user, sevenDaysAgo, today);
        List<DiaryEntry> diaries = diaryRepository.findByUserAndDateBetween(user, sevenDaysAgo, today);
        List<FocusSession> sessions = focusSessionRepository.findByUserAndDateRange(user, startZoned, endZoned);

        long completedTasks = tasks.stream().filter(Task::isCompleted).count();
        long totalFocusSeconds = sessions.stream()
                .filter(s -> s.getSessionType() == FocusSession.SessionType.FOCUS 
                          && s.getStatus() == FocusSession.SessionStatus.COMPLETED)
                .mapToLong(s -> {
                    if (s.getStartedAt() != null && s.getEndedAt() != null) {
                        return Duration.between(s.getStartedAt(), s.getEndedAt()).getSeconds() - s.getAccumulatedPauseSec();
                    }
                    return 0;
                }).sum();

        return ResponseEntity.ok(Map.of(
            "dateRange", Map.of("start", sevenDaysAgo, "end", today),
            "summary", Map.of(
                "tasksCompleted", completedTasks,
                "totalTasks", tasks.size(),
                "diaryEntries", diaries.size(),
                "focusSeconds", totalFocusSeconds
            ),
            "tasks", tasks,
            "diaries", diaries
        ));
    }
}
