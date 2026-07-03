package com.reflectos.backend.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "diary_entries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "date"})
})
public class DiaryEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    private String mood;

    @Column(columnDefinition = "TEXT")
    private String contentDraft;

    @Column(columnDefinition = "TEXT")
    private String contentSubmitted;

    private boolean isLocked;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public DiaryEntry() {
    }

    public DiaryEntry(User user, LocalDate date) {
        this.user = user;
        this.date = date;
        this.isLocked = false;
        this.createdAt = LocalDateTime.now();
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public String getContentDraft() {
        return contentDraft;
    }

    public void setContentDraft(String contentDraft) {
        this.contentDraft = contentDraft;
    }

    public String getContentSubmitted() {
        return contentSubmitted;
    }

    public void setContentSubmitted(String contentSubmitted) {
        this.contentSubmitted = contentSubmitted;
    }

    public boolean isLocked() {
        return isLocked;
    }

    public void setLocked(boolean locked) {
        isLocked = locked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
