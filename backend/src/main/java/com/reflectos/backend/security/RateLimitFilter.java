package com.reflectos.backend.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter for auth endpoints.
 *
 * Uses a token-bucket-like approach per IP: each IP gets a counter that
 * resets every {@code WINDOW_MS}. If the counter exceeds {@code MAX_REQUESTS},
 * we return 429 Too Many Requests.
 *
 * Good enough for a single-instance deployment. For multi-instance,
 * swap to Redis-backed bucket4j.
 */
@Component
@Order(2)
public class RateLimitFilter implements Filter {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS = 60_000; // 1 minute

    private final Map<String, RateBucket> buckets = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getRequestURI();

        // Only rate-limit auth endpoints
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            String clientIp = getClientIp(httpRequest);
            RateBucket bucket = buckets.compute(clientIp, (k, v) -> {
                long now = System.currentTimeMillis();
                if (v == null || now - v.windowStart > WINDOW_MS) {
                    return new RateBucket(now);
                }
                return v;
            });

            if (bucket.counter.incrementAndGet() > MAX_REQUESTS) {
                HttpServletResponse httpResponse = (HttpServletResponse) response;
                httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                httpResponse.setContentType("application/problem+json");
                httpResponse.getWriter().write("""
                    {
                      "type": "https://reflectos.dev/errors/rate-limit",
                      "title": "Too Many Requests",
                      "status": 429,
                      "detail": "Rate limit exceeded. Try again in a minute."
                    }
                    """);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class RateBucket {
        final long windowStart;
        final AtomicInteger counter = new AtomicInteger(0);

        RateBucket(long windowStart) {
            this.windowStart = windowStart;
        }
    }
}
