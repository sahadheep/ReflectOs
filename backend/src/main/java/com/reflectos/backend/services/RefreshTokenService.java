package com.reflectos.backend.services;

import com.reflectos.backend.models.RefreshToken;
import com.reflectos.backend.models.User;
import com.reflectos.backend.repositories.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Service for managing refresh tokens.
 *
 * The raw token is returned to the client once. We store only a SHA-256
 * hash of it — so even if the DB leaks, the tokens aren't directly usable.
 */
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${jwt.refreshExpirationMs:604800000}") // 7 days default
    private long refreshExpirationMs;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Creates a new refresh token for the given user.
     * Returns the raw token string (to send to the client).
     */
    @Transactional
    public String createRefreshToken(User user) {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        String hash = sha256(rawToken);

        RefreshToken entity = new RefreshToken(
                user,
                hash,
                ZonedDateTime.now().plusNanos(refreshExpirationMs * 1_000_000)
        );
        refreshTokenRepository.save(entity);
        return rawToken;
    }

    /**
     * Validates a raw refresh token:
     * 1. Hash it and look up in DB.
     * 2. Check not revoked.
     * 3. Check not expired.
     * Returns the associated User.
     */
    @Transactional
    public User validateAndRotate(String rawToken) {
        String hash = sha256(rawToken);
        RefreshToken entity = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (entity.isRevoked()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has been revoked");
        }
        if (entity.getExpiresAt().isBefore(ZonedDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has expired");
        }

        // Revoke the old token (rotate)
        entity.setRevoked(true);
        refreshTokenRepository.save(entity);

        return entity.getUser();
    }

    @Transactional
    public void revokeAllForUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
