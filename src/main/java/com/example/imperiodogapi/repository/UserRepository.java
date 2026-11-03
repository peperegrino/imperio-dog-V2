package com.example.imperiodogapi.repository;

import com.example.imperiodogapi.entities.User;
import com.example.imperiodogapi.entities.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByCpf(String cpf);

    boolean existsByRole(Role role);
}
