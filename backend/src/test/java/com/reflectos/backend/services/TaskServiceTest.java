package com.reflectos.backend.services;

import com.reflectos.backend.exceptions.ResourceNotFoundException;
import com.reflectos.backend.exceptions.UnauthorizedAccessException;
import com.reflectos.backend.models.Task;
import com.reflectos.backend.models.User;
import com.reflectos.backend.payload.request.TaskRequest;
import com.reflectos.backend.repositories.TaskRepository;
import com.reflectos.backend.repositories.UserRepository;
import com.reflectos.backend.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TaskService taskService;

    private User testUser;
    private Task testTask;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "test@test.com", "password");
        testUser.setId(1L);

        testTask = new Task(testUser, "Test Task", "Desc", "High", "Work", LocalDate.now());
        testTask.setId(100L);
    }

    private void mockSecurityContext() {
        UserDetailsImpl userDetails = UserDetailsImpl.build(testUser);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        SecurityContextHolder.setContext(securityContext);
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
    }

    @Test
    void getCurrentUser_ReturnsUser() {
        mockSecurityContext();
        User currentUser = taskService.getCurrentUser();
        assertEquals(testUser.getId(), currentUser.getId());
    }

    @Test
    void getDailyTasks_ReturnsTasksForDate() {
        LocalDate date = LocalDate.now();
        when(taskRepository.findByUserAndTargetDateOrderByCreatedAtAsc(testUser, date))
                .thenReturn(List.of(testTask));

        List<Task> tasks = taskService.getDailyTasks(testUser, date);
        
        assertEquals(1, tasks.size());
        assertEquals(testTask.getId(), tasks.get(0).getId());
    }

    @Test
    void createTask_SavesAndReturnsTask() {
        TaskRequest request = new TaskRequest();
        request.setTitle("New Task");
        request.setDescription("New Desc");
        request.setPriority("Low");
        request.setCategory("Personal");
        request.setTargetDate(LocalDate.now());

        when(taskRepository.save(any(Task.class))).thenAnswer(i -> {
            Task t = i.getArgument(0);
            t.setId(101L);
            return t;
        });

        Task result = taskService.createTask(testUser, request);
        
        assertNotNull(result.getId());
        assertEquals("New Task", result.getTitle());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void updateTask_WhenOwned_UpdatesSuccessfully() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskRequest request = new TaskRequest();
        request.setTitle("Updated Title");

        Task result = taskService.updateTask(testUser, 100L, request);

        assertEquals("Updated Title", result.getTitle());
    }

    @Test
    void updateTask_WhenNotOwned_ThrowsUnauthorized() {
        User otherUser = new User("other", "other@test.com", "pass");
        otherUser.setId(2L);
        testTask.setUser(otherUser);

        when(taskRepository.findById(100L)).thenReturn(Optional.of(testTask));

        TaskRequest request = new TaskRequest();
        
        assertThrows(UnauthorizedAccessException.class, () -> 
            taskService.updateTask(testUser, 100L, request)
        );
    }

    @Test
    void toggleComplete_TogglesState() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        assertFalse(testTask.isCompleted());
        Task result = taskService.toggleComplete(testUser, 100L);
        assertTrue(result.isCompleted());
        assertNotNull(result.getCompletedAt());
    }
}
