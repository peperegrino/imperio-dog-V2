package com.example.imperiodogapi.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ChargeRequestDTO(
        @NotNull Long customerId,
        @NotNull Long petId,
        Long serviceId,
        @NotNull LocalDate serviceDate,
        @NotNull LocalDate dueDate,
        @jakarta.validation.constraints.Size(min=1,max=10) java.util.List<@jakarta.validation.Valid Item> items
) {
    public record Item(@NotNull Long serviceId, @jakarta.validation.constraints.Min(1) @jakarta.validation.constraints.Max(100) int quantity) {}
    public ChargeRequestDTO(Long customerId,Long petId,Long serviceId,LocalDate serviceDate,LocalDate dueDate) {
        this(customerId,petId,serviceId,serviceDate,dueDate,null);
    }
    @jakarta.validation.constraints.AssertTrue(message="Provide serviceId or items, exclusively")
    public boolean isSelectionValid() { return (serviceId != null) != (items != null && !items.isEmpty()); }
    public java.util.List<Item> selectedItems() { return items == null ? java.util.List.of(new Item(serviceId,1)) : items; }
}
