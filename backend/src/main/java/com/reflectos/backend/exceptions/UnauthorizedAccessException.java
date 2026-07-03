package com.reflectos.backend.exceptions;

/**
 * Thrown when a user attempts to access or modify a resource they do not own.
 */
public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}
