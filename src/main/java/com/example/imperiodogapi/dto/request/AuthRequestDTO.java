package com.example.imperiodogapi.dto;

import com.example.imperiodogapi.entities.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthRequestDTO(
        @NotBlank @Email String email,
        @NotBlank String password,
        Role selectedRole
) {
    public AuthRequestDTO(String email, String password) {
        this(email, password, null);
    }
}
