package com.example.imperiodogapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PetRequestDTO(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 255) String species,
        @Size(max = 255) String breed,
        Long customerId,
        @Size(max=30) String sex,
        @jakarta.validation.constraints.PastOrPresent java.time.LocalDate birthDate,
        @jakarta.validation.constraints.DecimalMin("0.01") @jakarta.validation.constraints.Digits(integer=6,fraction=2) java.math.BigDecimal weight,
        @Size(max=2000) String notes
) {
    public PetRequestDTO(String name, String species, String breed, Long customerId) {
        this(name,species,breed,customerId,null,null,null,null);
    }
}
