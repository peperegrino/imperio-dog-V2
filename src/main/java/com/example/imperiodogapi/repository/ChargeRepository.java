package com.example.imperiodogapi.repository;

import com.example.imperiodogapi.entities.Charge;
import com.example.imperiodogapi.entities.enums.ChargeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDate;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChargeRepository extends JpaRepository<Charge, Long> {

    Optional<Charge> findByIdempotencyKey(String idempotencyKey);

    boolean existsByPetId(Long petId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Charge c where c.id = :id")
    Optional<Charge> findLockedById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Charge c where c.c6BankSlipId = :bankSlipId")
    List<Charge> findLockedByBankSlipId(@Param("bankSlipId") String bankSlipId);

    List<Charge> findByCustomerId(Long customerId);

    List<Charge> findByStatus(ChargeStatus status);

    List<Charge> findByC6BankSlipId(String c6BankSlipId);

    List<Charge> findByC6BankSlipIdIsNotNullAndStatusIn(List<ChargeStatus> statuses);

    List<Charge> findByStatusInAndDueDateBefore(List<ChargeStatus> statuses, LocalDate dueDate);
}
