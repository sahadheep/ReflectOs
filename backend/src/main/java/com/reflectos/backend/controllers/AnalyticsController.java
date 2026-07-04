package com.reflectos.backend.controllers;

import com.reflectos.backend.models.User;
import com.reflectos.backend.payload.response.AnalyticsResponse;
import com.reflectos.backend.services.AnalyticsService;
import com.reflectos.backend.services.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "${app.cors.origin:http://localhost:3000}", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final TaskService taskService; // Used to fetch current user context

    public AnalyticsController(AnalyticsService analyticsService, TaskService taskService) {
        this.analyticsService = analyticsService;
        this.taskService = taskService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsResponse> getAnalyticsSummary() {
        // Reuse taskService's getCurrentUser method to get authenticated user
        User user = taskService.getCurrentUser();
        AnalyticsResponse response = analyticsService.getAnalytics(user);
        return ResponseEntity.ok(response);
    }
}
