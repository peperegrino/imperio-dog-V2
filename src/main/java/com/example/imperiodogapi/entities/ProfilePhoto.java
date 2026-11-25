package com.example.imperiodogapi.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "profile_photos")
@Check(constraints = "(user_id IS NULL) <> (pet_id IS NULL)")
public class ProfilePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Pet pet;

    @Column(nullable = false, length = 1024 * 1024)
    private byte[] jpeg;

    protected ProfilePhoto() {}

    public ProfilePhoto(User user) {
        this.user = user;
    }

    public ProfilePhoto(Pet pet) {
        this.pet = pet;
    }

    public byte[] getJpeg() {
        return jpeg;
    }

    public void setJpeg(byte[] jpeg) {
        this.jpeg = jpeg;
    }
}
