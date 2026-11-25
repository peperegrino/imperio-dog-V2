package com.example.imperiodogapi.repository;

import com.example.imperiodogapi.entities.User;
import com.example.imperiodogapi.entities.enums.Role;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.email = :email")
    Optional<User> findLockedByEmail(@Param("email") String email);


    boolean existsByEmail(String email);

    boolean existsByCpf(String cpf);

    boolean existsByRole(Role role);
}
