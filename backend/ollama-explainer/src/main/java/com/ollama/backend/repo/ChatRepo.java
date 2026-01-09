package com.ollama.backend.repo;

import com.ollama.backend.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Must be present
import org.springframework.data.repository.query.Param; // Must be present
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatRepo extends JpaRepository<Chat, Long> {

    @Query("SELECT c FROM Chat c WHERE c.sessionId = :sessionId ORDER BY c.id ASC")
    List<Chat> findBySessionIdOrderByTimestampAsc(@Param("sessionId") String sessionId);

    @Query("SELECT c FROM Chat c WHERE c.userId = (SELECT u.id FROM User u WHERE u.email = :email) ORDER BY c.id DESC")
    List<Chat> findTop3BySessionIdOrderByIdDesc(@Param("email") String email);

    // Use this specific query to get the last 3 messages in the right order for AI context
@Query(value = "SELECT * FROM (SELECT * FROM chats WHERE session_id = :sessionId ORDER BY timestamp DESC LIMIT 3) AS sub ORDER BY timestamp ASC", nativeQuery = true)
List<Chat> findContextForAI(@Param("sessionId") String sessionId);
}