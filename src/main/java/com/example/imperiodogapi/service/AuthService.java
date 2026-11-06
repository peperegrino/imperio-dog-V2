package com.example.imperiodogapi.service;

import com.example.imperiodogapi.dto.AuthRequestDTO;
import com.example.imperiodogapi.dto.AuthResponseDTO;
import com.example.imperiodogapi.entities.User;
import com.example.imperiodogapi.repository.UserRepository;
import com.example.imperiodogapi.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponseDTO login(AuthRequestDTO request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (org.springframework.security.core.AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return new AuthResponseDTO(tokenProvider.generateToken(user.getEmail(), user.getRole()),
                "Bearer", "ROLE_" + user.getRole().name());
    }
}
