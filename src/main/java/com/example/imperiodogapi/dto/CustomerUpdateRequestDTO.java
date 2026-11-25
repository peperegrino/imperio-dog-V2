package com.example.imperiodogapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerUpdateRequestDTO(
        @NotBlank @Size(max = 40) String name,
        @Size(max = 30) String phone
) {
}
