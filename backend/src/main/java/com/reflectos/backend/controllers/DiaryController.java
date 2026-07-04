package com.reflectos.backend.controllers;

import com.reflectos.backend.models.DiaryEntry;
import com.reflectos.backend.models.User;
import com.reflectos.backend.payload.request.DiaryRequest;
import com.reflectos.backend.services.DiaryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import jakarta.validation.Valid;

@CrossOrigin(origins = "${CORS_ORIGIN:http://localhost:3000}", maxAge = 3600)
@RestController
@RequestMapping("/api/diary")
public class DiaryController {

    private final DiaryService diaryService;

    public DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    @GetMapping("/today")
    public ResponseEntity<DiaryEntry> getTodayEntry(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = diaryService.getCurrentUser();
        return ResponseEntity.ok(diaryService.getOrCreateEntry(user, date));
    }

    @GetMapping("/daily")
    public ResponseEntity<DiaryEntry> getDailyEntry(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = diaryService.getCurrentUser();
        return ResponseEntity.ok(diaryService.getOrCreateEntry(user, date));
    }

    @PostMapping("/daily")
    public ResponseEntity<DiaryEntry> saveDailyDraft(@RequestBody DiaryRequest request) {
        User user = diaryService.getCurrentUser();
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        String content = request.getContent() != null ? request.getContent() : request.getText();
        DiaryRequest updatedRequest = new DiaryRequest();
        updatedRequest.setMood(request.getMood());
        updatedRequest.setContent(content);
        return ResponseEntity.ok(diaryService.saveDraft(user, date, updatedRequest));
    }

    @GetMapping("/history")
    public ResponseEntity<List<DiaryEntry>> getDiaryHistory() {
        User user = diaryService.getCurrentUser();
        return ResponseEntity.ok(diaryService.getHistory(user));
    }

    @PostMapping("/draft")
    public ResponseEntity<DiaryEntry> saveDraft(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody DiaryRequest request) {
        User user = diaryService.getCurrentUser();
        return ResponseEntity.ok(diaryService.saveDraft(user, date, request));
    }

    @PostMapping("/{date}/submit")
    public ResponseEntity<DiaryEntry> submitDiary(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                  @Valid @RequestBody DiaryRequest request) {
        User user = diaryService.getCurrentUser();
        return ResponseEntity.ok(diaryService.submitDiary(user, date, request));
    }

    @GetMapping("/search")
    public ResponseEntity<List<DiaryEntry>> searchDiary(@RequestParam String q) {
        User user = diaryService.getCurrentUser();
        return ResponseEntity.ok(diaryService.search(user, q));
    }
}
