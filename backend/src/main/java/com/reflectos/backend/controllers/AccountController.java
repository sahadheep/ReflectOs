package com.reflectos.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reflectos.backend.models.User;
import com.reflectos.backend.services.DiaryService;
import com.reflectos.backend.services.TaskService;
import com.reflectos.backend.repositories.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/v1/account")
public class AccountController {

    private final TaskService taskService;
    private final DiaryService diaryService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public AccountController(TaskService taskService, DiaryService diaryService, UserRepository userRepository, ObjectMapper objectMapper) {
        this.taskService = taskService;
        this.diaryService = diaryService;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Exports all user data (tasks, diary entries) as a JSON file inside a ZIP archive.
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportData() throws Exception {
        User user = taskService.getCurrentUser();

        Map<String, Object> exportData = Map.of(
                "user", Map.of(
                        "username", user.getUsername(),
                        "email", user.getEmail()
                ),
                "tasks", taskService.getTaskHistory(user),
                "diary", diaryService.getHistory(user)
        );

        String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(exportData);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            ZipEntry entry = new ZipEntry("reflectos_export.json");
            zos.putNextEntry(entry);
            zos.write(json.getBytes());
            zos.closeEntry();
        }

        byte[] zipBytes = baos.toByteArray();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"reflectos_export.zip\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(zipBytes);
    }

    /**
     * Deletes the user account and all associated data (via ON DELETE CASCADE).
     */
    @DeleteMapping
    @Transactional
    public ResponseEntity<?> deleteAccount() {
        User user = taskService.getCurrentUser();
        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
