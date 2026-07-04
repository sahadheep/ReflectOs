package com.reflectos.backend.repositories;

import com.reflectos.backend.models.DiaryEntry;
import com.reflectos.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {
    Optional<DiaryEntry> findByUserAndDate(User user, LocalDate date);
    List<DiaryEntry> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);
    List<DiaryEntry> findByUserOrderByDateDesc(User user);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM diary_entries WHERE user_id = :userId AND search_vector @@ plainto_tsquery('english', :query) ORDER BY date DESC", nativeQuery = true)
    List<DiaryEntry> searchByQuery(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("query") String query);
}
