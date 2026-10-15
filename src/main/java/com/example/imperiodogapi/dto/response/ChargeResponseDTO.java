package com.example.imperiodogapi.dto;

import com.example.imperiodogapi.entities.enums.ChargeStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ChargeResponseDTO(
        Long id,
        String customerName,
        String petName,
        String serviceName,
        BigDecimal amount,
        LocalDate serviceDate,
        LocalDate dueDate,
        LocalDateTime paymentDate,
        ChargeStatus status,
        String ticketUrl,
        Long customerId,
        String customerEmail,
        String barcode,
        String digitableLine
) {
}
