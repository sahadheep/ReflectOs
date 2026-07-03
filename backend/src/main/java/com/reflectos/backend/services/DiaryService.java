package com.reflectos.backend.services;

import com.reflectos.backend.exceptions.ResourceNotFoundException;
import com.reflectos.backend.models.DiaryEntry;
import com.reflectos.backend.models.User;
import com.reflectos.backend.payload.request.DiaryRequest;
import com.reflectos.backend.repositories.DiaryEntryRepository;
import com.reflectos.backend.repositories.UserRepository;
import com.reflectos.backend.security.services.UserDetailsImpl;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service layer for Diary operations.
 * Handles daily entry creation, draft saving, final submission,
 * and streak tracking.
 */
@Service
public class DiaryService {

    private final DiaryEntryRepository diaryEntryRepository;
    private final UserRepository userRepository;

    public DiaryService(DiaryEntryRepository diaryEntryRepository, UserRepository userRepository) {
        this.diaryEntryRepository = diaryEntryRepository;
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

    /**
     * Gets or creates the diary entry for the given date.
     * If no entry exists yet, a blank one is persisted and returned.
     */
    @Transactional
    public DiaryEntry getOrCreateEntry(User user, LocalDate date) {
        return diaryEntryRepository.findByUserAndDate(user, date)
                .orElseGet(() -> diaryEntryRepository.save(new DiaryEntry(user, date)));
    }

    /** Returns the full diary history for a user, newest first. */
    public List<DiaryEntry> getHistory(User user) {
        return diaryEntryRepository.findByUserOrderByDateDesc(user);
    }

    /**
     * Saves a draft of the diary entry for the given date.
     * @throws IllegalStateException if the entry is already locked (submitted).
     */
    @Transactional
    public DiaryEntry saveDraft(User user, LocalDate date, DiaryRequest request) {
        DiaryEntry entry = diaryEntryRepository.findByUserAndDate(user, date)
                .orElse(new DiaryEntry(user, date));

        if (entry.isLocked()) {
            throw new IllegalStateException("Diary is already locked for this date.");
        }

        entry.setMood(request.getMood());
        entry.setContentDraft(request.getContent());
        return diaryEntryRepository.save(entry);
    }

    /**
     * Finalises and locks the diary entry for the given date.
     * Also increments the user's streak counter.
     * @throws ResourceNotFoundException if no diary entry exists for the date.
     * @throws IllegalStateException     if the entry is already locked.
     */
    @Transactional
    public DiaryEntry submitDiary(User user, LocalDate date, DiaryRequest request) {
        DiaryEntry entry = diaryEntryRepository.findByUserAndDate(user, date)
                .orElseThrow(() -> new ResourceNotFoundException("Diary entry not found for date: " + date));

        if (entry.isLocked()) {
            throw new IllegalStateException("Diary is already locked.");
        }

        entry.setMood(request.getMood());
        entry.setContentSubmitted(request.getContent());
        entry.setLocked(true);

        // Update streak
        user.setStreak(user.getStreak() + 1);
        userRepository.save(user);

        return diaryEntryRepository.save(entry);
    }
}
