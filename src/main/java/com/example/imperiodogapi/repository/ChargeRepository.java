package com.example.imperiodogapi.repository;

import com.example.imperiodogapi.entities.Charge;
import com.example.imperiodogapi.entities.enums.ChargeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDate;

public interface ChargeRepository extends JpaRepository<Charge, Long> {

    List<Charge> findByCustomerId(Long customerId);

    List<Charge> findByStatus(ChargeStatus status);

    List<Charge> findByC6BankSlipId(String c6BankSlipId);

    List<Charge> findByC6BankSlipIdIsNotNullAndStatusIn(List<ChargeStatus> statuses);

    List<Charge> findByStatusInAndDueDateBefore(List<ChargeStatus> statuses, LocalDate dueDate);
}
