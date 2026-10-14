package com.example.imperiodogapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PetRequestDTO(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 255) String species,
        @Size(max = 255) String breed,
        @NotNull Long customerId
) {
}
