package com.reflectos.backend.services.notifications;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reflectos.backend.services.OutboxPollerService.DomainEventEnvelope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Consumes internal domain events (published by the outbox poller)
 * and dispatches them to the appropriate NotificationChannel.
 *
 * Design pattern: Observer (listens to DomainEventEnvelope) and
 * Strategy (selects NotificationChannel implementation).
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final List<NotificationChannel> channels;
    private final ObjectMapper objectMapper;

    public NotificationService(List<NotificationChannel> channels, ObjectMapper objectMapper) {
        this.channels = channels;
        this.objectMapper = objectMapper;
    }

    @EventListener
    public void handleDomainEvent(DomainEventEnvelope envelope) {
        try {
            JsonNode payload = objectMapper.readTree(envelope.getPayload());

            // Example event handling logic
            if ("TASK_DUE".equals(envelope.getType())) {
                String email = payload.path("email").asText();
                String taskTitle = payload.path("taskTitle").asText();
                
                String subject = "Task Due Soon: " + taskTitle;
                String content = "Just a reminder that your task '" + taskTitle + "' is due soon.";
                
                sendNotification("EMAIL", email, subject, content);
            } else if ("DAILY_DIGEST".equals(envelope.getType())) {
                String email = payload.path("email").asText();
                String subject = "Your ReflectOS Daily Digest";
                String content = "Here is your daily summary...";
                
                sendNotification("EMAIL", email, subject, content);
            }
        } catch (Exception e) {
            log.error("Failed to process domain event for notification: {}", envelope.getType(), e);
            // Re-throwing could cause the OutboxPoller to mark it FAILED
            throw new RuntimeException(e);
        }
    }

    private void sendNotification(String channelType, String destination, String subject, String content) {
        NotificationChannel channel = channels.stream()
                .filter(c -> c.supports(channelType))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No notification channel found for: " + channelType));

        channel.send(destination, subject, content);
    }
}
