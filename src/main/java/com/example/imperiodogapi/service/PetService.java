package com.example.imperiodogapi.service;

import com.example.imperiodogapi.dto.PetRequestDTO;
import com.example.imperiodogapi.dto.PetResponseDTO;
import com.example.imperiodogapi.entities.Customer;
import com.example.imperiodogapi.entities.Pet;
import com.example.imperiodogapi.repository.CustomerRepository;
import com.example.imperiodogapi.repository.PetRepository;
import com.example.imperiodogapi.repository.ChargeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final CustomerRepository customerRepository;
    private final ChargeRepository chargeRepository;

    public PetService(PetRepository petRepository, CustomerRepository customerRepository, ChargeRepository chargeRepository) {
        this.petRepository = petRepository;
        this.customerRepository = customerRepository;
        this.chargeRepository = chargeRepository;
    }

    @Transactional
    public PetResponseDTO create(PetRequestDTO request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o nome do pet");
        }
        if (request.customerId() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Select a customer");
        Customer customer = getCustomerWithCapacity(request.customerId());
        validateBirthDate(request.birthDate());
        validateWeight(request.species(), request.weight());
        Pet pet = Pet.builder()
                .name(request.name().trim())
                .species(request.species())
                .breed(request.breed())
                .sex(request.sex()).birthDate(request.birthDate()).weight(request.weight()).notes(request.notes())
                .customer(customer)
                .build();
        return toDto(petRepository.save(pet));
    }

    @Transactional(readOnly = true)
    public List<PetResponseDTO> findAll() {
        return petRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public PetResponseDTO findById(Long id) {
        return toDto(getPet(id));
    }

    @Transactional
    public PetResponseDTO update(Long id, PetRequestDTO request) {
        Pet pet = petRepository.findLockedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found"));

        if (request.customerId() != null) {
            if (!pet.getCustomer().getId().equals(request.customerId()) && chargeRepository.existsByPetId(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A pet with charge history cannot change customer");
            }
            if (!pet.getCustomer().getId().equals(request.customerId())) {
                pet.setCustomer(getCustomerWithCapacity(request.customerId()));
            }
        }
        if (request.name() != null) {
            if (request.name().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o nome do pet");
            pet.setName(request.name().trim());
        }
        if (request.birthDate() != null) validateBirthDate(request.birthDate());
        if (request.weight() != null || request.species() != null) {
            validateWeight(
                request.species() != null ? request.species() : pet.getSpecies(),
                request.weight() != null ? request.weight() : pet.getWeight()
            );
        }
        if (request.species() != null) pet.setSpecies(request.species());
        if (request.breed() != null) pet.setBreed(request.breed());
        if (request.sex() != null) pet.setSex(request.sex());
        if (request.birthDate() != null) pet.setBirthDate(request.birthDate());
        if (request.weight() != null) pet.setWeight(request.weight());
        if (request.notes() != null) pet.setNotes(request.notes());
        return toDto(petRepository.save(pet));
    }

    @Transactional
public void delete(Long id) {
    Pet pet = petRepository.findLockedById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Pet not found"));

    if (chargeRepository.existsByPetId(id)) {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Pet has charge history");
    }

    petRepository.delete(pet);
}

private void validateOwnership(Long id, Long customerId) {
    Pet pet = petRepository.findLockedById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Pet not found"));

    if (!pet.getCustomer().getId().equals(customerId)) {
        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Pet not found");
    }
}

@Transactional
public PetResponseDTO updateOwnPet(
        Long id, Long customerId, PetRequestDTO request) {

    validateOwnership(id, customerId);

    return update(id, new PetRequestDTO(
            request.name(),
            request.species(),
            request.breed(),
            customerId,
            request.sex(),
            request.birthDate(),
            request.weight(),
            request.notes()
    ));
}

@Transactional
public void deleteOwnPet(Long id, Long customerId) {
    validateOwnership(id, customerId);
    delete(id);
}

    private Pet getPet(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found"));
    }

    private Customer getCustomerWithCapacity(Long id) {
        Customer customer = customerRepository.findLockedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutor nao encontrado"));

        if (petRepository.countByCustomerId(id) >= 30) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Limite de 30 pets por tutor atingido");
        }
        return customer;
    }

    private void validateBirthDate(java.time.LocalDate birthDate) {
        if (birthDate == null) return;
        java.time.LocalDate today = java.time.LocalDate.now();
        if (birthDate.isAfter(today) || birthDate.isBefore(today.minusYears(30))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A idade do pet deve estar entre 0 e 30 anos");
        }
    }

    private void validateWeight(String species, java.math.BigDecimal weight) {
        if (weight == null) return;
        java.math.BigDecimal minimum = new java.math.BigDecimal("0.05");
        java.math.BigDecimal maximum = new java.math.BigDecimal(
            "Gato".equalsIgnoreCase(species) ? "25" : "150"
        );

        if (weight.compareTo(minimum) < 0 || weight.compareTo(maximum) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Peso permitido: 0,05 a " + maximum + " kg");
        }
    }

    private PetResponseDTO toDto(Pet pet) {
        return new PetResponseDTO(pet.getId(), pet.getName(), pet.getSpecies(), pet.getBreed(), pet.getCustomer().getId(),pet.getSex(),pet.getBirthDate(),pet.getWeight(),pet.getNotes());
    }
}
