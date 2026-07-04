package com.reflectos.backend.controllers;

import com.reflectos.backend.models.Task;
import com.reflectos.backend.models.User;
import com.reflectos.backend.payload.request.TaskRequest;
import com.reflectos.backend.payload.response.MessageResponse;
import com.reflectos.backend.services.TaskService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "${CORS_ORIGIN:http://localhost:3000}", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        User user = taskService.getCurrentUser();
        return ResponseEntity.ok(taskService.getTaskHistory(user));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Task> patchTask(@PathVariable Long id, @RequestBody java.util.Map<String, Object> updates) {
        User user = taskService.getCurrentUser();
        return ResponseEntity.ok(taskService.patchTask(user, id, updates));
    }

    @GetMapping("/daily")
    public ResponseEntity<List<Task>> getDailyTasks(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = taskService.getCurrentUser();
        return ResponseEntity.ok(taskService.getDailyTasks(user, date));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Task>> getAllTaskHistory() {
        User user = taskService.getCurrentUser();
        return ResponseEntity.ok(taskService.getTaskHistory(user));
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskRequest taskRequest) {
        User user = taskService.getCurrentUser();
        return ResponseEntity.ok(taskService.createTask(user, taskRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest taskRequest) {
        User user = taskService.getCurrentUser();
        return ResponseEntity.ok(taskService.updateTask(user, id, taskRequest));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Task> toggleTaskComplete(@PathVariable Long id) {
        User user = taskService.getCurrentUser();
        return ResponseEntity.ok(taskService.toggleComplete(user, id));
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<Task> toggleTaskPriority(@PathVariable Long id) {
        User user = taskService.getCurrentUser();
        return ResponseEntity.ok(taskService.togglePriority(user, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteTask(@PathVariable Long id) {
        User user = taskService.getCurrentUser();
        taskService.deleteTask(user, id);
        return ResponseEntity.ok(new MessageResponse("Task deleted successfully"));
    }
}
