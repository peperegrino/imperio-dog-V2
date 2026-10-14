package com.example.imperiodogapi.repository;

import com.example.imperiodogapi.entities.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
}
