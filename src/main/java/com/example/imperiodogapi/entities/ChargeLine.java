package com.example.imperiodogapi.entities;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
@Embeddable @Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChargeLine {
    private Long serviceId;
    private String name;
    private int quantity;
    @Column(precision=10,scale=2)
    private BigDecimal unitPrice;
}
