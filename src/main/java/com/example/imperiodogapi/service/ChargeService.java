package com.example.imperiodogapi.service;

import com.example.imperiodogapi.dto.ChargeRequestDTO;
import com.example.imperiodogapi.dto.ChargeResponseDTO;
import com.example.imperiodogapi.entities.Charge;
import com.example.imperiodogapi.entities.enums.ChargeStatus;
import com.example.imperiodogapi.repository.ChargeRepository;
import com.example.imperiodogapi.repository.CustomerRepository;
import com.example.imperiodogapi.repository.PetRepository;
import com.example.imperiodogapi.repository.ServiceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class ChargeService {

    private final ChargeRepository chargeRepository;
    private final CustomerRepository customerRepository;
    private final PetRepository petRepository;
    private final ServiceRepository serviceRepository;
    private final C6BankService c6BankService;

    public ChargeService(ChargeRepository chargeRepository, CustomerRepository customerRepository,
                         PetRepository petRepository, ServiceRepository serviceRepository,
                         C6BankService c6BankService) {
        this.chargeRepository = chargeRepository;
        this.customerRepository = customerRepository;
        this.petRepository = petRepository;
        this.serviceRepository = serviceRepository;
        this.c6BankService = c6BankService;
    }

    @Transactional
    public ChargeResponseDTO createCharge(ChargeRequestDTO request) {
        LocalDate today = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        if (request.serviceDate().isAfter(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Service date cannot be in the future");
        }
        if (request.dueDate().isBefore(request.serviceDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Boleto due date cannot be before the service date");
        }
        if (request.dueDate().isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Boleto due date cannot be in the past");
        }
        var customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        var pet = petRepository.findById(request.petId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found"));
        var service = serviceRepository.findById(request.serviceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
        if (!pet.getCustomer().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pet does not belong to this customer");
        }

        Charge charge = Charge.builder()
                .customer(customer)
                .pet(pet)
                .service(service)
                .amount(service.getPrice())
                .serviceDate(request.serviceDate())
                .dueDate(request.dueDate())
                .status(ChargeStatus.PENDING)
                .c6ExternalReferenceId(C6BankService.newExternalReferenceId())
                .build();
        charge = chargeRepository.saveAndFlush(charge);

        C6BankService.Boleto boleto = c6BankService.createBoleto(charge);
        charge.setC6BankSlipId(boleto.id());
        charge.setBarcode(boleto.barcode());
        charge.setDigitableLine(boleto.digitableLine());
        return toResponse(chargeRepository.save(charge));
    }

    @Transactional
    public List<ChargeResponseDTO> findMyCharges(String email) {
        updateOverdueCharges();
        var customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        return chargeRepository.findByCustomerId(customer.getId()).stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<ChargeResponseDTO> findAll(ChargeStatus status) {
        updateOverdueCharges();
        List<Charge> charges = status == null ? chargeRepository.findAll() : chargeRepository.findByStatus(status);
        return charges.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ChargeResponseDTO findByIdForUser(Long id, String email, boolean admin) {
        Charge charge = chargeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Charge not found"));
        if (!admin && !charge.getCustomer().getUser().getEmail().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot view this charge");
        }
        return toResponse(charge);
    }

    @Transactional(readOnly = true)
    public String findBankSlipIdForUser(Long id, String email, boolean admin) {
        Charge charge = chargeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Charge not found"));
        if (!admin && !charge.getCustomer().getUser().getEmail().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot view this charge");
        }
        if (charge.getC6BankSlipId() == null || charge.getC6BankSlipId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto not found for this charge");
        }
        return charge.getC6BankSlipId();
    }

    @Transactional
    public void updateOverdueCharges() {
        LocalDate today = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        List<Charge> overdueCharges = chargeRepository.findByStatusInAndDueDateBefore(
                List.of(ChargeStatus.PENDING, ChargeStatus.PAYMENT_IN_PROCESS), today);
        overdueCharges.forEach(charge -> charge.setStatus(ChargeStatus.OVERDUE));
        chargeRepository.saveAll(overdueCharges);
    }

    private ChargeResponseDTO toResponse(Charge charge) {
        String ticketUrl = charge.getC6BankSlipId() != null
                ? "/api/charges/" + charge.getId() + "/boleto" : charge.getLegacyTicketUrl();
        return new ChargeResponseDTO(charge.getId(), charge.getCustomer().getUser().getName(),
                charge.getPet().getName(), charge.getService().getName(), charge.getAmount(),
                charge.getServiceDate(), charge.getDueDate(), charge.getPaymentDate(),
                charge.getStatus(), ticketUrl, charge.getCustomer().getId(),
                charge.getBarcode(), charge.getDigitableLine());
    }
}
