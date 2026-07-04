package com.reflectos.backend.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.reflectos.backend.models.Task;
import com.reflectos.backend.models.TaskTemplate;
import com.reflectos.backend.repositories.TaskRepository;
import com.reflectos.backend.repositories.TaskTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service to materialize Task instances from TaskTemplates.
 * Runs daily via @Scheduled to create tasks for the current day.
 */
@Service
public class RecurringTaskService {

    private static final Logger log = LoggerFactory.getLogger(RecurringTaskService.class);

    private final TaskTemplateRepository templateRepository;
    private final TaskRepository taskRepository;
    private final OutboxService outboxService;
    private final ObjectMapper objectMapper;

    public RecurringTaskService(TaskTemplateRepository templateRepository, 
                                TaskRepository taskRepository,
                                OutboxService outboxService,
                                ObjectMapper objectMapper) {
        this.templateRepository = templateRepository;
        this.taskRepository = taskRepository;
        this.outboxService = outboxService;
        this.objectMapper = objectMapper;
    }

    /**
     * Runs every day at 1:00 AM server time.
     * Checks all active templates and materializes instances for today if applicable.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void materializeTasksForToday() {
        LocalDate today = LocalDate.now();
        List<TaskTemplate> templates = templateRepository.findByActive(true);
        
        int count = 0;
        for (TaskTemplate template : templates) {
            if (shouldMaterialize(template, today)) {
                
                // 1. Create the materialized Task
                Task task = new Task(
                        template.getUser(),
                        template.getTitle(),
                        template.getDescription(),
                        template.getPriority(),
                        template.getCategory(),
                        today
                );
                task.setTemplate(template);
                
                taskRepository.save(task);
                count++;
                
                // 2. Enqueue a notification event (Outbox pattern)
                try {
                    ObjectNode payload = objectMapper.createObjectNode();
                    payload.put("taskId", task.getId());
                    payload.put("taskTitle", task.getTitle());
                    payload.put("email", template.getUser().getEmail());
                    payload.put("targetDate", today.toString());
                    
                    outboxService.enqueue("TASK_DUE", objectMapper.writeValueAsString(payload));
                } catch (JsonProcessingException e) {
                    log.error("Failed to enqueue TASK_DUE event for task {}", task.getId(), e);
                }
            }
        }
        
        log.info("Materialized {} recurring tasks for {}", count, today);
    }

    private boolean shouldMaterialize(TaskTemplate template, LocalDate date) {
        String type = template.getRecurrenceType();
        if ("DAILY".equals(type)) {
            return true;
        } else if ("WEEKDAYS".equals(type)) {
            int dayOfWeek = date.getDayOfWeek().getValue();
            return dayOfWeek >= 1 && dayOfWeek <= 5;
        } else if ("WEEKLY".equals(type)) {
            if (template.getRecurrenceDays() == null) return false;
            String currentDay = String.valueOf(date.getDayOfWeek().getValue());
            return template.getRecurrenceDays().contains(currentDay);
        }
        return false;
    }
}
