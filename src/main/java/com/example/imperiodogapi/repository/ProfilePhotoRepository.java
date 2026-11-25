package com.example.imperiodogapi.repository;

import com.example.imperiodogapi.entities.ProfilePhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfilePhotoRepository extends JpaRepository<ProfilePhoto, Long> {
    Optional<ProfilePhoto> findByUser_Id(Long userId);
    Optional<ProfilePhoto> findByPet_Id(Long petId);
}
