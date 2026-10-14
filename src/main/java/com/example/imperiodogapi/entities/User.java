package com.example.imperiodogapi.entities;

import com.example.imperiodogapi.entities.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @Column(name = "zip_code", length = 16)
    private String zipCode;

    @Column(name = "street_name")
    private String streetName;

    @Column(name = "street_number", length = 32)
    private String streetNumber;

    private String neighborhood;

    private String city;

    @Column(name = "federal_unit", length = 2)
    private String federalUnit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}
