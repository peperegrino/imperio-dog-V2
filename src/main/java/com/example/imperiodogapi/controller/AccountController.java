package com.example.imperiodogapi.controller;

import com.example.imperiodogapi.entities.User;
import com.example.imperiodogapi.repository.*;
import com.example.imperiodogapi.dto.*;
import com.example.imperiodogapi.service.PetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;

@RestController
@RequestMapping({"/account", "/api/account"})
public class AccountController {
    private final UserRepository users;
    private final CustomerRepository customers;
    private final PetRepository pets;
    private final PetService petService;
    public AccountController(UserRepository users, CustomerRepository customers, PetRepository pets, PetService petService) {
        this.users=users; this.customers=customers; this.pets=pets; this.petService=petService;
    }
    public record Profile(Long id, String name, String email, String phone, String cpf, String role) {}
    public record ProfileUpdate(@NotBlank @Size(max=40) String name, @Size(max=30) String phone) {}
    private User user(UserDetails principal) { return users.findByEmail(principal.getUsername()).orElseThrow(); }
    private Profile profile(User u) { return new Profile(u.getId(),u.getName(),u.getEmail(),u.getPhone(),"***.***.***-**",u.getRole().name()); }
    @GetMapping("/me")
    public Profile me(@AuthenticationPrincipal UserDetails principal) { return profile(user(principal)); }
    @PutMapping("/me") @Transactional
    public Profile update(@AuthenticationPrincipal UserDetails principal, @Valid @RequestBody ProfileUpdate request) {
        User u=user(principal); u.setName(request.name().trim()); u.setPhone(request.phone()); return profile(u);
    }
    private Long customerId(UserDetails principal) {
        return customers.findByUserEmail(principal.getUsername()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Customer not found")).getId();
    }
    @GetMapping("/pets") @Transactional(readOnly=true)
    public List<PetResponseDTO> pets(@AuthenticationPrincipal UserDetails principal) {
        return pets.findByCustomerId(customerId(principal)).stream().map(p -> new PetResponseDTO(p.getId(),p.getName(),p.getSpecies(),p.getBreed(),p.getCustomer().getId(),p.getSex(),p.getBirthDate(),p.getWeight(),p.getNotes())).toList();
    }
    @PostMapping("/pets")
    public PetResponseDTO addPet(@AuthenticationPrincipal UserDetails principal, @Valid @RequestBody PetRequestDTO request) {
        return petService.create(new PetRequestDTO(request.name(),request.species(),request.breed(),customerId(principal),request.sex(),request.birthDate(),request.weight(),request.notes()));
    }
}
