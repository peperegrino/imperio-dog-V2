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
        if (request.customerId() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Select a customer");
        Customer customer = getCustomer(request.customerId());
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
        if (request.customerId() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Select a customer");
        Pet pet = petRepository.findLockedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found"));
        if (!pet.getCustomer().getId().equals(request.customerId()) && chargeRepository.existsByPetId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A pet with charge history cannot change customer");
        }
        pet.setName(request.name().trim());
        pet.setSpecies(request.species());
        pet.setBreed(request.breed());
        pet.setSex(request.sex()); pet.setBirthDate(request.birthDate()); pet.setWeight(request.weight()); pet.setNotes(request.notes());
        pet.setCustomer(getCustomer(request.customerId()));
        return toDto(petRepository.save(pet));
    }

    @Transactional
    public void delete(Long id) {
        petRepository.delete(getPet(id));
    }

    private Pet getPet(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found"));
    }

    private Customer getCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
    }

    private PetResponseDTO toDto(Pet pet) {
        return new PetResponseDTO(pet.getId(), pet.getName(), pet.getSpecies(), pet.getBreed(), pet.getCustomer().getId(),pet.getSex(),pet.getBirthDate(),pet.getWeight(),pet.getNotes());
    }
}
