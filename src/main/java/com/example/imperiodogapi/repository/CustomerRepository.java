package com.example.imperiodogapi.repository;

import com.example.imperiodogapi.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByUserEmail(String email);

    Optional<Customer> findByUserId(Long userId);
}
