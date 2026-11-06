package com.example.imperiodogapi.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Deprecated(forRemoval = false)
public record ServiceDTO(
        Long id,
        @NotBlank @Size(max = 255) String name,
        @Size(max = 255) String description,
        @NotNull @DecimalMin(value = "0.01") BigDecimal price
) {
}
