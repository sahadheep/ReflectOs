package com.reflectos.backend.exceptions;

/**
 * Thrown when a requested resource (task, diary entry, user, etc.) is not found.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
