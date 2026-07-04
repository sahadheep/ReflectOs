package com.reflectos.backend.controllers;

import com.reflectos.backend.models.User;
import com.reflectos.backend.payload.request.LoginRequest;
import com.reflectos.backend.payload.request.SignupRequest;
import com.reflectos.backend.payload.response.JwtResponse;
import com.reflectos.backend.payload.response.MessageResponse;
import com.reflectos.backend.repositories.UserRepository;
import com.reflectos.backend.security.jwt.JwtUtils;
import com.reflectos.backend.security.services.UserDetailsImpl;
import com.reflectos.backend.services.RefreshTokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

@CrossOrigin(origins = "${app.cors.allowed-origins:${CORS_ALLOWED_ORIGINS:http://localhost:3000}}", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    RefreshTokenService refreshTokenService;

    @Value("${app.dev-mode-auth:false}")
    boolean devModeAuth;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Issue a refresh token alongside the short-lived access token
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "refreshToken", refreshToken,
                "id", userDetails.getId(),
                "username", userDetails.getUsername(),
                "email", userDetails.getEmail()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    /**
     * Exchange a valid refresh token for a new access token + new refresh token.
     * The old refresh token is revoked (rotation).
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> body) {
        String rawRefreshToken = body.get("refreshToken");
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("refreshToken is required"));
        }

        User user = refreshTokenService.validateAndRotate(rawRefreshToken);

        // Generate new access token
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
        // The above won't work because user.getPassword() is encoded.
        // Instead, generate the JWT directly from the username.
        String jwt = jwtUtils.generateJwtTokenFromUsername(user.getUsername());

        // Issue a new refresh token
        String newRefreshToken = refreshTokenService.createRefreshToken(user);

        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "refreshToken", newRefreshToken,
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail()
        ));
    }

    @PostMapping("/dev-login")
    public ResponseEntity<?> devLogin() {
        if (!devModeAuth) {
            return ResponseEntity.notFound().build();
        }

        String devEmail = "dev@reflectos.com";
        if (!userRepository.existsByEmail(devEmail)) {
            User devUser = new User("devuser", devEmail, encoder.encode("devpassword"));
            userRepository.save(devUser);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken("devuser", "devpassword"));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "refreshToken", refreshToken,
                "id", userDetails.getId(),
                "username", userDetails.getUsername(),
                "email", userDetails.getEmail()
        ));
    }
}
