package com.reflectos.backend.services;

import com.reflectos.backend.models.OutboxEvent;
import com.reflectos.backend.repositories.OutboxEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Writes events to the outbox table within the caller's transaction.
 *
 * Design pattern: Outbox — the event is persisted in the same DB transaction
 * as the domain write, so it's guaranteed to exist if the domain write commits.
 * A separate poller (OutboxPollerService) picks up PENDING events and publishes
 * them, achieving at-least-once delivery without dual-write risk.
 *
 * Interview talking point: "We avoid the dual-write problem where the domain
 * write succeeds but the event publish fails (or vice versa) by making them
 * a single atomic operation."
 */
@Service
public class OutboxService {

    private final OutboxEventRepository outboxEventRepository;

    public OutboxService(OutboxEventRepository outboxEventRepository) {
        this.outboxEventRepository = outboxEventRepository;
    }

    /**
     * Enqueue an event for later publication.
     * Must be called within an existing @Transactional context.
     */
    @Transactional
    public void enqueue(String eventType, String jsonPayload) {
        OutboxEvent event = new OutboxEvent(eventType, jsonPayload);
        outboxEventRepository.save(event);
    }
}
