package com.example.imperiodogapi.controller;

import com.example.imperiodogapi.service.ProfilePhotoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/account", "/api/account"})
public class ProfilePhotoController {
    private final ProfilePhotoService photos;

    public ProfilePhotoController(ProfilePhotoService photos) {
        this.photos = photos;
    }

    public record Photo(String data) {}

    public record PhotoUpload(
            @NotBlank(message = "Selecione uma foto.")
            @Size(max = ProfilePhotoService.MAX_BASE64_LENGTH, message = "A foto deve ter até 4 MB.")
            String base64
    ) {}

    @GetMapping("/me/photo")
    public ResponseEntity<Photo> accountPhoto(@AuthenticationPrincipal UserDetails principal) {
        return photo(photos.accountPhoto(principal.getUsername()));
    }

    @PutMapping("/me/photo")
    public ResponseEntity<Photo> updateAccountPhoto(@AuthenticationPrincipal UserDetails principal,
                                                     @Valid @RequestBody PhotoUpload request) {
        return photo(photos.updateAccountPhoto(principal.getUsername(), request.base64()));
    }

    @GetMapping("/pets/{id}/photo")
    public ResponseEntity<Photo> petPhoto(@AuthenticationPrincipal UserDetails principal, @PathVariable @Positive Long id) {
        return photo(photos.petPhoto(principal.getUsername(), id));
    }

    @PutMapping("/pets/{id}/photo")
    public ResponseEntity<Photo> updatePetPhoto(@AuthenticationPrincipal UserDetails principal,
                                                @PathVariable @Positive Long id, @Valid @RequestBody PhotoUpload request) {
        return photo(photos.updatePetPhoto(principal.getUsername(), id, request.base64()));
    }

    private static ResponseEntity<Photo> photo(String data) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new Photo(data));
    }
}
