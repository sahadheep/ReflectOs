package com.reflectos.backend.services.notifications;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Concrete strategy for sending emails.
 * (In a real app, this would use JavaMailSender or a 3rd party API).
 */
@Component
public class EmailNotificationChannel implements NotificationChannel {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationChannel.class);

    @Override
    public boolean supports(String type) {
        return "EMAIL".equalsIgnoreCase(type);
    }

    @Override
    public void send(String destination, String subject, String content) {
        // Stub implementation
        log.info("📧 Sending EMAIL to {}: [{}] {}", destination, subject, content);
    }
}
