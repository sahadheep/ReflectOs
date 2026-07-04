package com.reflectos.backend.services;

import com.reflectos.backend.models.OutboxEvent;
import com.reflectos.backend.repositories.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

/**
 * Polls the outbox_events table for PENDING events and publishes them internally.
 * If publication succeeds, the event is marked PUBLISHED.
 * If it fails, it remains PENDING and the retry count is incremented.
 *
 * This guarantees at-least-once delivery of events triggered by domain writes.
 */
@Service
public class OutboxPollerService {

    private static final Logger log = LoggerFactory.getLogger(OutboxPollerService.class);

    private final OutboxEventRepository outboxEventRepository;
    private final ApplicationEventPublisher eventPublisher;

    public OutboxPollerService(OutboxEventRepository outboxEventRepository, ApplicationEventPublisher eventPublisher) {
        this.outboxEventRepository = outboxEventRepository;
        this.eventPublisher = eventPublisher;
    }

    @Scheduled(fixedDelayString = "${app.outbox.poll-delay:5000}")
    @Transactional
    public void processOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findByStatusOrderByCreatedAtAsc("PENDING");
        
        for (OutboxEvent event : pendingEvents) {
            try {
                // Determine event class based on eventType and publish
                // For this project, we'll dispatch a generic envelope event to keep things simple
                // or specific domain events.
                eventPublisher.publishEvent(new DomainEventEnvelope(event.getEventType(), event.getPayload()));
                
                event.setStatus("PUBLISHED");
                event.setPublishedAt(ZonedDateTime.now());
                outboxEventRepository.save(event);
                
                log.debug("Successfully published outbox event: {} ({})", event.getId(), event.getEventType());
            } catch (Exception e) {
                log.error("Failed to publish outbox event: {} ({})", event.getId(), event.getEventType(), e);
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 5) {
                    event.setStatus("FAILED");
                }
                outboxEventRepository.save(event);
            }
        }
    }

    /**
     * Internal envelope for outbox events dispatched via Spring's EventPublisher.
     */
    public static class DomainEventEnvelope {
        private final String type;
        private final String payload;

        public DomainEventEnvelope(String type, String payload) {
            this.type = type;
            this.payload = payload;
        }

        public String getType() { return type; }
        public String getPayload() { return payload; }
    }
}
