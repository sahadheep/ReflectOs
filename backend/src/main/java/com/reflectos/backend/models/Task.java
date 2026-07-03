package com.reflectos.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String priority; // Low, Medium, High

    @NotBlank
    private String category; // DSA, College, Work, Fitness, etc.

    @NotNull
    private LocalDate targetDate; // The date this task belongs to

    private boolean completed;

    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "is_top_priority", columnDefinition = "boolean default false")
    private Boolean isTopPriority = false;

    public Task() {
    }

    public Task(User user, String title, String description, String priority, String category, LocalDate targetDate) {
        this.user = user;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.category = category;
        this.targetDate = targetDate;
        this.completed = false;
        this.createdAt = LocalDateTime.now();
        this.isTopPriority = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsTopPriority() {
        return isTopPriority;
    }

    public boolean isTopPriority() {
        return isTopPriority != null && isTopPriority;
    }

    public void setTopPriority(Boolean topPriority) {
        isTopPriority = topPriority;
    }
}
