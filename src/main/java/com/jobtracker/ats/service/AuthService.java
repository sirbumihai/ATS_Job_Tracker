package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.AuthResponse;
import com.jobtracker.ats.dto.LoginRequest;
import com.jobtracker.ats.dto.RegisterRequest;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.UserRepository;
import com.jobtracker.ats.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Adresa de email este deja inregistrata in sistem.");
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .build();

        User savedUser = userRepository.saveAndFlush(user);
        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getId());

        return new AuthResponse(token, savedUser.getId(), savedUser.getEmail(), savedUser.getFullName());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Email-ul sau parola sunt incorecte."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Email-ul sau parola sunt incorecte.");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName());
    }
}
