package com.reflectos.backend.security;

import com.reflectos.backend.models.IdempotencyKey;
import com.reflectos.backend.repositories.IdempotencyKeyRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.Optional;

/**
 * Filter to handle the Idempotency-Key header for state-mutating requests (POST, PATCH).
 * If the key has been seen before, we return the cached response instead of
 * executing the request again. This prevents duplicate creations (e.g. on flaky networks).
 */
@Component
@Order(3)
public class IdempotencyFilter implements Filter {

    private static final String HEADER_IDEMPOTENCY_KEY = "Idempotency-Key";

    private final IdempotencyKeyRepository idempotencyKeyRepository;

    public IdempotencyFilter(IdempotencyKeyRepository idempotencyKeyRepository) {
        this.idempotencyKeyRepository = idempotencyKeyRepository;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String method = httpRequest.getMethod();

        // Only enforce/cache for POST and PATCH
        if (HttpMethod.POST.name().equalsIgnoreCase(method) || HttpMethod.PATCH.name().equalsIgnoreCase(method)) {
            String idempotencyKey = httpRequest.getHeader(HEADER_IDEMPOTENCY_KEY);

            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                Optional<IdempotencyKey> existingKeyOpt = idempotencyKeyRepository.findById(idempotencyKey);

                if (existingKeyOpt.isPresent()) {
                    IdempotencyKey existingKey = existingKeyOpt.get();
                    if (existingKey.getResponseStatus() != null) {
                        // Return cached response
                        httpResponse.setStatus(existingKey.getResponseStatus());
                        if (existingKey.getResponseBody() != null) {
                            httpResponse.setContentType("application/json");
                            httpResponse.getWriter().write(existingKey.getResponseBody());
                        }
                        return; // Halt chain, do not execute the request again
                    } else {
                        // Key exists but no response yet means it's currently processing
                        httpResponse.setStatus(409); // Conflict
                        httpResponse.getWriter().write("{\"error\": \"Request already in progress\"}");
                        return;
                    }
                }

                // First time seeing this key. Record it.
                IdempotencyKey newKey = new IdempotencyKey(idempotencyKey);
                idempotencyKeyRepository.save(newKey);

                // Wrap response to capture body
                ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(httpResponse);

                try {
                    chain.doFilter(request, responseWrapper);
                } finally {
                    // Save response back to DB
                    newKey.setResponseStatus(responseWrapper.getStatus());
                    byte[] responseBody = responseWrapper.getContentAsByteArray();
                    if (responseBody.length > 0) {
                        newKey.setResponseBody(new String(responseBody, responseWrapper.getCharacterEncoding()));
                    }
                    idempotencyKeyRepository.save(newKey);

                    // Copy content to actual response
                    responseWrapper.copyBodyToResponse();
                }
                return;
            }
        }

        chain.doFilter(request, response);
    }
}
