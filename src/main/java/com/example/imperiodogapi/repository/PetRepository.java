package com.example.imperiodogapi.repository;

import com.example.imperiodogapi.entities.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PetRepository extends JpaRepository<Pet, Long> {

    List<Pet> findByCustomerId(Long customerId);
}
