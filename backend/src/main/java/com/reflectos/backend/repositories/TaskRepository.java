package com.reflectos.backend.repositories;

import com.reflectos.backend.models.Task;
import com.reflectos.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserAndTargetDateOrderByCreatedAtAsc(User user, LocalDate targetDate);
    List<Task> findByUserOrderByTargetDateDesc(User user);
}
