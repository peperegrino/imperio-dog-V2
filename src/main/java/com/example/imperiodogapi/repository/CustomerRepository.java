package com.example.imperiodogapi.repository;

import com.example.imperiodogapi.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select c from Customer c where c.id = :id")
    Optional<Customer> findLockedById(@org.springframework.data.repository.query.Param("id") Long id);

    Optional<Customer> findByUserEmail(String email);

    Optional<Customer> findByUserId(Long userId);
}
