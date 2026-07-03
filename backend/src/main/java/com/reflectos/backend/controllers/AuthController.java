package com.reflectos.backend.controllers;

import com.reflectos.backend.models.User;
import com.reflectos.backend.payload.request.LoginRequest;
import com.reflectos.backend.payload.request.SignupRequest;
import com.reflectos.backend.payload.response.JwtResponse;
import com.reflectos.backend.payload.response.MessageResponse;
import com.reflectos.backend.repositories.UserRepository;
import com.reflectos.backend.security.jwt.JwtUtils;
import com.reflectos.backend.security.services.UserDetailsImpl;
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
import java.util.Optional;

@CrossOrigin(origins = "${CORS_ORIGIN:http://localhost:3000}", maxAge = 3600)
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

    @Value("${app.dev-mode-auth:false}")
    boolean devModeAuth;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail()));
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

    @PostMapping("/dev-login")
    public ResponseEntity<?> devLogin() {
        if (!devModeAuth) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Dev mode auth is disabled."));
        }

        String devEmail = "dev@reflectos.com";
        User devUser;
        if (!userRepository.existsByEmail(devEmail)) {
            devUser = new User("devuser", devEmail, encoder.encode("devpassword"));
            userRepository.save(devUser);
        } else {
            // Find by email - we need to fetch it to get the ID.
            // But UserRepository doesn't have findByEmail in standard methods. Let's just create a dummy query or we might need to add it.
            // Wait, we can authenticate using the normal flow since we know the password!
        }
        
        // Actually, we can just use the normal authenticate flow since we just created/ensured devuser with devpassword exists!
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken("devuser", "devpassword"));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail()));
    }
}
