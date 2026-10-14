package com.example.imperiodogapi.entities;



import com.example.imperiodogapi.entities.enums.ChargeStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "charges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Charge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChargeStatus status;

    @Column(name = "c6_bank_slip_id")
    private String c6BankSlipId;

    @Column(name = "c6_external_reference_id", unique = true, length = 10)
    private String c6ExternalReferenceId;

    @Column(name = "barcode", length = 64)
    private String barcode;

    @Column(name = "digitable_line", length = 80)
    private String digitableLine;

    @Column(name = "mercado_pago_id")
    private String legacyMercadoPagoId;

    @Column(name = "ticket_url", length = 1000)
    private String legacyTicketUrl;
}
