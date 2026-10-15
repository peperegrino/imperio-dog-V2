package com.example.imperiodogapi.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ChargeRequestDTO(
        @NotNull Long customerId,
        @NotNull Long petId,
        @NotNull Long serviceId,
        @NotNull LocalDate serviceDate,
        @NotNull LocalDate dueDate
) {
}
