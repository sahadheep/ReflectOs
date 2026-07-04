package com.reflectos.backend.services;

import com.reflectos.backend.exceptions.ResourceNotFoundException;
import com.reflectos.backend.exceptions.UnauthorizedAccessException;
import com.reflectos.backend.models.Task;
import com.reflectos.backend.models.User;
import com.reflectos.backend.payload.request.TaskRequest;
import com.reflectos.backend.repositories.TaskRepository;
import com.reflectos.backend.repositories.UserRepository;
import com.reflectos.backend.security.services.UserDetailsImpl;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service layer for Task operations.
 * Encapsulates all business logic for task CRUD, ownership verification,
 * and priority management.
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    /** Resolves the currently authenticated user from the security context. */
    public User getCurrentUser() {
        UserDetailsImpl userDetails =
                (UserDetailsImpl) SecurityContextHolder.getContext()
                        .getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /** Returns all tasks for the given user on the specified date, ordered by creation time. */
    public List<Task> getDailyTasks(User user, LocalDate date) {
        return taskRepository.findByUserAndTargetDateOrderByCreatedAtAsc(user, date);
    }

    /** Returns the full task history for a user, ordered by target date descending. */
    public List<Task> getTaskHistory(User user) {
        return taskRepository.findByUserOrderByTargetDateDesc(user);
    }

    /** Creates a new task owned by the given user. */
    @Transactional
    public Task createTask(User user, TaskRequest request) {
        Task task = new Task(
                user,
                request.getTitle(),
                request.getDescription(),
                request.getPriority() == null || request.getPriority().isBlank() ? "medium" : request.getPriority(),
                request.getCategory() == null || request.getCategory().isBlank() ? "General" : request.getCategory(),
                request.getTargetDate()
        );
        return taskRepository.save(task);
    }

    /** Updates an existing task. Verifies ownership before modifying. */
    @Transactional
    public Task updateTask(User user, Long taskId, TaskRequest request) {
        Task task = findOwnedTask(user, taskId);
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getPriority() != null && !request.getPriority().isBlank()) {
            task.setPriority(request.getPriority());
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            task.setCategory(request.getCategory());
        }
        if (request.getTargetDate() != null) {
            task.setTargetDate(request.getTargetDate());
        }
        return taskRepository.save(task);
    }

    /** Toggles the completed status for a task. */
    @Transactional
    public Task toggleComplete(User user, Long taskId) {
        Task task = findOwnedTask(user, taskId);
        task.setCompleted(!task.isCompleted());
        task.setCompletedAt(task.isCompleted() ? LocalDateTime.now() : null);
        return taskRepository.save(task);
    }

    /** Toggles the top-priority flag for a task. */
    @Transactional
    public Task togglePriority(User user, Long taskId) {
        Task task = findOwnedTask(user, taskId);
        task.setTopPriority(!task.isTopPriority());
        return taskRepository.save(task);
    }

    /** Partially updates an existing task dynamically. */
    @Transactional
    public Task patchTask(User user, Long taskId, java.util.Map<String, Object> updates) {
        Task task = findOwnedTask(user, taskId);
        if (updates.containsKey("completed")) {
            boolean completed = (boolean) updates.get("completed");
            task.setCompleted(completed);
            task.setCompletedAt(completed ? LocalDateTime.now() : null);
        }
        if (updates.containsKey("title")) {
            task.setTitle((String) updates.get("title"));
        }
        if (updates.containsKey("priority")) {
            task.setPriority((String) updates.get("priority"));
        }
        if (updates.containsKey("category")) {
            task.setCategory((String) updates.get("category"));
        }
        return taskRepository.save(task);
    }

    /** Deletes a task. Verifies ownership before deleting. */
    @Transactional
    public void deleteTask(User user, Long taskId) {
        Task task = findOwnedTask(user, taskId);
        taskRepository.delete(task);
    }

    // ─── Internal helpers ─────────────────────────────────────────

    /**
     * Finds a task by ID and verifies that the given user owns it.
     * @throws ResourceNotFoundException    if the task does not exist.
     * @throws UnauthorizedAccessException  if the user does not own the task.
     */
    private Task findOwnedTask(User user, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("You do not have permission to access this task.");
        }
        return task;
    }
}
