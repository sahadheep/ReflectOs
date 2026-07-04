package com.reflectos.backend.services.notifications;

/**
 * Strategy interface for sending notifications.
 * Implementations might send emails, web push notifications, or SMS.
 */
public interface NotificationChannel {
    
    /**
     * @return true if this channel supports the given notification type
     */
    boolean supports(String type);
    
    /**
     * Send a notification to a specific user address/token.
     * @param destination e.g. email address, device token
     * @param subject Title or subject of the notification
     * @param content Body of the notification
     */
    void send(String destination, String subject, String content);
}
