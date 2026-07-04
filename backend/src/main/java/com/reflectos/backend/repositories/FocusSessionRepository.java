package com.reflectos.backend.repositories;

import com.reflectos.backend.models.FocusSession;
import com.reflectos.backend.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FocusSessionRepository extends JpaRepository<FocusSession, UUID> {
    Optional<FocusSession> findFirstByUserAndStatusInOrderByStartedAtDesc(User user, List<FocusSession.SessionStatus> statuses);

    Page<FocusSession> findByUserOrderByStartedAtDesc(User user, Pageable pageable);

    @Query("SELECT fs FROM FocusSession fs WHERE fs.user = :user AND fs.startedAt >= :from AND fs.startedAt <= :to")
    List<FocusSession> findByUserAndDateRange(User user, ZonedDateTime from, ZonedDateTime to);
    
    @Query("SELECT fs FROM FocusSession fs WHERE fs.status IN ('RUNNING', 'PAUSED') AND fs.startedAt < :cutoff")
    List<FocusSession> findStaleSessions(ZonedDateTime cutoff);
}
