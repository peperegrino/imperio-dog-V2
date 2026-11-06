package com.example.imperiodogapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CustomerRequestDTO(
        @NotBlank @Size(max = 40) String name,
        @NotBlank @Email @Size(max = 200) String email,
        @NotBlank @Size(min = 12, max = 72) String password,
        @Size(max = 30) String phone,
        @NotBlank @Pattern(regexp = "(?:\\d{11}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2})") String cpf,
        @NotBlank @Pattern(regexp = "(?:\\d{8}|\\d{5}-\\d{3})") String zipCode,
        @NotBlank @Size(max = 33) String streetName,
        @NotBlank @Pattern(regexp = "\\d{1,7}") String streetNumber,
        @NotBlank @Size(max = 100) String neighborhood,
        @NotBlank @Size(max = 40) String city,
        @NotBlank @Pattern(regexp = "[A-Za-z]{2}") String federalUnit
) {
}
