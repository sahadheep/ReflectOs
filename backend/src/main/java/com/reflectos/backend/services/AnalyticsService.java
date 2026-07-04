package com.reflectos.backend.services;

import com.reflectos.backend.models.DiaryEntry;
import com.reflectos.backend.models.Task;
import com.reflectos.backend.models.User;
import com.reflectos.backend.payload.response.AnalyticsResponse;
import com.reflectos.backend.repositories.DiaryEntryRepository;
import com.reflectos.backend.repositories.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final TaskRepository taskRepository;
    private final DiaryEntryRepository diaryEntryRepository;

    public AnalyticsService(TaskRepository taskRepository, DiaryEntryRepository diaryEntryRepository) {
        this.taskRepository = taskRepository;
        this.diaryEntryRepository = diaryEntryRepository;
    }

    public AnalyticsResponse getAnalytics(User user) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(29); // 30 days total

        List<Task> tasks = taskRepository.findByUserAndTargetDateBetween(user, startDate, endDate);
        List<DiaryEntry> diaries = diaryEntryRepository.findByUserAndDateBetween(user, startDate, endDate);

        // Map by date string
        Map<String, List<Task>> tasksByDate = tasks.stream()
                .filter(t -> t.getTargetDate() != null)
                .collect(Collectors.groupingBy(t -> t.getTargetDate().toString()));

        Map<String, DiaryEntry> diariesByDate = diaries.stream()
                .filter(d -> d.getDate() != null)
                .collect(Collectors.toMap(d -> d.getDate().toString(), d -> d));

        List<AnalyticsResponse.DailyStat> dailyStats = new ArrayList<>();
        Map<String, Integer> moodCounts = new HashMap<>();
        int totalEntriesLogged = 0;
        int daysTracked = 0;

        for (int i = 0; i <= 29; i++) {
            LocalDate date = startDate.plusDays(i);
            String dateStr = date.toString();

            List<Task> dayTasks = tasksByDate.getOrDefault(dateStr, Collections.emptyList());
            DiaryEntry dayDiary = diariesByDate.get(dateStr);

            int tasksTotal = dayTasks.size();
            int tasksCompleted = (int) dayTasks.stream().filter(Task::isCompleted).count();
            double productivityScore = tasksTotal > 0 ? (double) tasksCompleted / tasksTotal : 0.0;
            
            boolean diaryLogged = false;
            String mood = null;

            if (dayDiary != null) {
                if (dayDiary.isLocked()) {
                    diaryLogged = true;
                    totalEntriesLogged++;
                }
                mood = dayDiary.getMood();
                if (mood != null && !mood.trim().isEmpty()) {
                    moodCounts.put(mood, moodCounts.getOrDefault(mood, 0) + 1);
                }
            }

            if (tasksTotal > 0 || diaryLogged) {
                daysTracked++;
            }

            dailyStats.add(new AnalyticsResponse.DailyStat(
                    dateStr, tasksCompleted, tasksTotal, productivityScore, mood, diaryLogged
            ));
        }

        String topMood = "N/A";
        int maxCount = 0;
        for (Map.Entry<String, Integer> entry : moodCounts.entrySet()) {
            if (entry.getValue() > maxCount) {
                maxCount = entry.getValue();
                topMood = entry.getKey();
            }
        }

        return new AnalyticsResponse(totalEntriesLogged, topMood, daysTracked, dailyStats);
    }
}
