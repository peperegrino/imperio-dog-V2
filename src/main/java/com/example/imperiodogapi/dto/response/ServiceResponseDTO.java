package com.example.imperiodogapi.dto;

import java.math.BigDecimal;

public record ServiceResponseDTO(
        Long id,
        String name,
        String description,
        BigDecimal price
) {
}
