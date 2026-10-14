package com.example.imperiodogapi.controller;

import com.example.imperiodogapi.dto.ChargeRequestDTO;
import com.example.imperiodogapi.dto.ChargeResponseDTO;
import com.example.imperiodogapi.dto.CustomerRequestDTO;
import com.example.imperiodogapi.dto.CustomerResponseDTO;
import com.example.imperiodogapi.dto.PetRequestDTO;
import com.example.imperiodogapi.dto.PetResponseDTO;
import com.example.imperiodogapi.dto.ServiceRequestDTO;
import com.example.imperiodogapi.dto.ServiceResponseDTO;
import com.example.imperiodogapi.entities.enums.ChargeStatus;
import com.example.imperiodogapi.service.ChargeService;
import com.example.imperiodogapi.service.CustomerService;
import com.example.imperiodogapi.service.PetService;
import com.example.imperiodogapi.service.ServiceEntityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/admin", "/api/admin"})
public class AdminController {

    private final CustomerService customerService;
    private final ServiceEntityService serviceEntityService;
    private final PetService petService;
    private final ChargeService chargeService;

    public AdminController(CustomerService customerService, ServiceEntityService serviceEntityService,
                           PetService petService, ChargeService chargeService) {
        this.customerService = customerService;
        this.serviceEntityService = serviceEntityService;
        this.petService = petService;
        this.chargeService = chargeService;
    }

    @PostMapping("/customers")
    public ResponseEntity<CustomerResponseDTO> createCustomer(@Valid @RequestBody CustomerRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(request));
    }

    @GetMapping("/customers")
    public List<CustomerResponseDTO> listCustomers() {
        return customerService.findAll();
    }

    @PostMapping("/services")
    public ResponseEntity<ServiceResponseDTO> createService(@Valid @RequestBody ServiceRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceEntityService.create(request));
    }

    @GetMapping("/services")
    public List<ServiceResponseDTO> listServices() {
        return serviceEntityService.findAll();
    }

    @GetMapping("/services/{id}")
    public ServiceResponseDTO getService(@PathVariable Long id) {
        return serviceEntityService.findById(id);
    }

    @PutMapping("/services/{id}")
    public ServiceResponseDTO updateService(@PathVariable Long id, @Valid @RequestBody ServiceRequestDTO request) {
        return serviceEntityService.update(id, request);
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceEntityService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/pets")
    public ResponseEntity<PetResponseDTO> createPet(@Valid @RequestBody PetRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(petService.create(request));
    }

    @GetMapping("/pets")
    public List<PetResponseDTO> listPets() {
        return petService.findAll();
    }

    @GetMapping("/pets/{id}")
    public PetResponseDTO getPet(@PathVariable Long id) {
        return petService.findById(id);
    }

    @PutMapping("/pets/{id}")
    public PetResponseDTO updatePet(@PathVariable Long id, @Valid @RequestBody PetRequestDTO request) {
        return petService.update(id, request);
    }

    @DeleteMapping("/pets/{id}")
    public ResponseEntity<Void> deletePet(@PathVariable Long id) {
        petService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/charges")
    public ResponseEntity<ChargeResponseDTO> createCharge(@Valid @RequestBody ChargeRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chargeService.createCharge(request));
    }

    @GetMapping("/charges")
    public List<ChargeResponseDTO> listCharges(@RequestParam(required = false) ChargeStatus status) {
        return chargeService.findAll(status);
    }
}
