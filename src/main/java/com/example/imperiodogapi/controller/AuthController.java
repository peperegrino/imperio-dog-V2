package com.example.imperiodogapi.controller;

import com.example.imperiodogapi.dto.AuthRequestDTO;
import com.example.imperiodogapi.dto.AuthResponseDTO;
import com.example.imperiodogapi.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/auth", "/api/auth"})
public class AuthController {

    private final AuthService authService;
    private final com.example.imperiodogapi.service.CustomerService customers;

    public AuthController(AuthService authService, com.example.imperiodogapi.service.CustomerService customers) {
        this.authService = authService;
        this.customers = customers;
    }

    @PostMapping("/register")
    public ResponseEntity<com.example.imperiodogapi.dto.CustomerResponseDTO> register(
            @Valid @RequestBody com.example.imperiodogapi.dto.CustomerRequestDTO request) {
        return ResponseEntity.status(201).body(customers.createCustomer(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
