package com.reflectos.backend.services;

import com.reflectos.backend.exceptions.ResourceNotFoundException;
import com.reflectos.backend.models.DiaryEntry;
import com.reflectos.backend.models.User;
import com.reflectos.backend.payload.request.DiaryRequest;
import com.reflectos.backend.repositories.DiaryEntryRepository;
import com.reflectos.backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiaryServiceTest {

    @Mock
    private DiaryEntryRepository diaryEntryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DiaryService diaryService;

    private User testUser;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "test@test.com", "password");
        testUser.setId(1L);
        testUser.setStreak(5);
        today = LocalDate.now();
    }

    @Test
    void getOrCreateEntry_WhenExists_ReturnsExisting() {
        DiaryEntry existing = new DiaryEntry(testUser, today);
        existing.setId(10L);
        when(diaryEntryRepository.findByUserAndDate(testUser, today))
                .thenReturn(Optional.of(existing));

        DiaryEntry result = diaryService.getOrCreateEntry(testUser, today);
        
        assertEquals(10L, result.getId());
        verify(diaryEntryRepository, never()).save(any());
    }

    @Test
    void getOrCreateEntry_WhenNotExists_CreatesNew() {
        when(diaryEntryRepository.findByUserAndDate(testUser, today))
                .thenReturn(Optional.empty());
        when(diaryEntryRepository.save(any(DiaryEntry.class))).thenAnswer(i -> i.getArgument(0));

        DiaryEntry result = diaryService.getOrCreateEntry(testUser, today);
        
        assertNotNull(result);
        assertEquals(testUser, result.getUser());
        assertEquals(today, result.getDate());
    }

    @Test
    void saveDraft_WhenNotLocked_SavesDraft() {
        DiaryEntry entry = new DiaryEntry(testUser, today);
        when(diaryEntryRepository.findByUserAndDate(testUser, today))
                .thenReturn(Optional.of(entry));
        when(diaryEntryRepository.save(any(DiaryEntry.class))).thenReturn(entry);

        DiaryRequest request = new DiaryRequest();
        request.setMood("Good");
        request.setContent("Draft content");

        DiaryEntry result = diaryService.saveDraft(testUser, today, request);

        assertEquals("Good", result.getMood());
        assertEquals("Draft content", result.getContentDraft());
        assertFalse(result.isLocked());
    }

    @Test
    void saveDraft_WhenLocked_ThrowsIllegalState() {
        DiaryEntry entry = new DiaryEntry(testUser, today);
        entry.setLocked(true);
        when(diaryEntryRepository.findByUserAndDate(testUser, today))
                .thenReturn(Optional.of(entry));

        DiaryRequest request = new DiaryRequest();
        
        assertThrows(IllegalStateException.class, () -> 
            diaryService.saveDraft(testUser, today, request)
        );
    }

    @Test
    void submitDiary_WhenValid_LocksAndIncrementsStreak() {
        DiaryEntry entry = new DiaryEntry(testUser, today);
        when(diaryEntryRepository.findByUserAndDate(testUser, today))
                .thenReturn(Optional.of(entry));
        when(diaryEntryRepository.save(any(DiaryEntry.class))).thenReturn(entry);

        DiaryRequest request = new DiaryRequest();
        request.setMood("Great");
        request.setContent("Final content");

        DiaryEntry result = diaryService.submitDiary(testUser, today, request);

        assertTrue(result.isLocked());
        assertEquals("Final content", result.getContentSubmitted());
        
        // Streak should be incremented from 5 to 6
        assertEquals(6, testUser.getStreak());
        verify(userRepository).save(testUser);
    }

    @Test
    void submitDiary_WhenNotFound_ThrowsNotFound() {
        when(diaryEntryRepository.findByUserAndDate(testUser, today))
                .thenReturn(Optional.empty());

        DiaryRequest request = new DiaryRequest();
        
        assertThrows(ResourceNotFoundException.class, () -> 
            diaryService.submitDiary(testUser, today, request)
        );
    }
}
