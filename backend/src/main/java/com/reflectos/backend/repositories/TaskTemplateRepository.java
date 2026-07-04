package com.reflectos.backend.repositories;

import com.reflectos.backend.models.TaskTemplate;
import com.reflectos.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, Long> {
    List<TaskTemplate> findByUserAndActive(User user, boolean active);
    List<TaskTemplate> findByActive(boolean active);
    List<TaskTemplate> findByUser(User user);
}
