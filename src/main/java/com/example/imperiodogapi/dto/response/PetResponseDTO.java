package com.example.imperiodogapi.dto;

public record PetResponseDTO(
        Long id,
        String name,
        String species,
        String breed,
        Long customerId
) {
}
