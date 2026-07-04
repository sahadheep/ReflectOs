package com.reflectos.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * A recurring task template. The recurrence pattern is stored here;
 * actual Task instances are materialized by a daily scheduled job.
 *
 * Design decision: materializing instances (instead of computing recurrence
 * at read time) lets us handle completions, edits, and deletions of
 * individual occurrences cleanly without complex recurrence-exception logic.
 */
@Entity
@Table(name = "task_templates")
public class TaskTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private String priority = "medium";

    @Column(nullable = false)
    private String category = "General";

    /**
     * DAILY, WEEKLY, or WEEKDAYS.
     */
    @Column(name = "recurrence_type", nullable = false)
    private String recurrenceType;

    /**
     * Comma-separated day numbers for WEEKLY recurrence (1=Mon..7=Sun).
     * Null for DAILY and WEEKDAYS.
     */
    @Column(name = "recurrence_days")
    private String recurrenceDays;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public TaskTemplate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getRecurrenceType() { return recurrenceType; }
    public void setRecurrenceType(String recurrenceType) { this.recurrenceType = recurrenceType; }
    public String getRecurrenceDays() { return recurrenceDays; }
    public void setRecurrenceDays(String recurrenceDays) { this.recurrenceDays = recurrenceDays; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
