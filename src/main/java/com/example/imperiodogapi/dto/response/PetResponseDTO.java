package com.example.imperiodogapi.dto;

public record PetResponseDTO(
        Long id,
        String name,
        String species,
        String breed,
        Long customerId,
        String sex, java.time.LocalDate birthDate, java.math.BigDecimal weight, String notes
) {
    public PetResponseDTO(Long id,String name,String species,String breed,Long customerId) {
        this(id,name,species,breed,customerId,null,null,null,null);
    }
}
