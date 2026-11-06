package com.example.imperiodogapi.repository;

import com.example.imperiodogapi.entities.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PetRepository extends JpaRepository<Pet, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pet p where p.id = :id")
    Optional<Pet> findLockedById(@Param("id") Long id);

    List<Pet> findByCustomerId(Long customerId);
}
