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

    @PostMapping("/submit")
    public ResponseEntity<DiaryEntry> submitDiary(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody DiaryRequest request) {
        User user = diaryService.getCurrentUser();
        return ResponseEntity.ok(diaryService.submitDiary(user, date, request));
    }
}
