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
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final TransactionTemplate transactions;

    public ChargeService(ChargeRepository chargeRepository, CustomerRepository customerRepository,
                         PetRepository petRepository, ServiceRepository serviceRepository,
                         C6BankService c6BankService, PlatformTransactionManager transactionManager) {
        this.chargeRepository = chargeRepository;
        this.customerRepository = customerRepository;
        this.petRepository = petRepository;
        this.serviceRepository = serviceRepository;
        this.c6BankService = c6BankService;
        this.transactions = new TransactionTemplate(transactionManager);
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public ChargeResponseDTO createCharge(ChargeRequestDTO request, String idempotencyKey) {
        if (idempotencyKey == null || !idempotencyKey.matches("[A-Za-z0-9_-]{16,128}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Idempotency-Key must contain 16 to 128 letters, digits, underscores or hyphens");
        }
        var existing = transactions.execute(tx -> chargeRepository.findByIdempotencyKey(idempotencyKey)
                .map(charge -> replay(charge, request)).orElse(null));
        if (existing != null) return existing;

        Charge reserved;
        try {
            reserved = transactions.execute(tx -> reserve(request, idempotencyKey));
        } catch (DataIntegrityViolationException exception) {
            // A concurrent request may have committed this same key first.
            return transactions.execute(tx -> chargeRepository.findByIdempotencyKey(idempotencyKey)
                    .map(charge -> replay(charge, request)).orElseThrow(() -> exception));
        }
        try {
            // No database transaction is held during the external request.
            C6BankService.Boleto boleto = c6BankService.createBoleto(reserved);
            return transactions.execute(tx -> {
                Charge charge = chargeRepository.findLockedById(reserved.getId()).orElseThrow();
                attachBoleto(charge, boleto);
                return toResponse(chargeRepository.saveAndFlush(charge));
            });
        } catch (RuntimeException exception) {
            transactions.executeWithoutResult(tx -> {
                Charge charge = chargeRepository.findLockedById(reserved.getId()).orElseThrow();
                if (charge.getC6BankSlipId() == null) charge.setIssuanceState("UNKNOWN");
            });
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Boleto issuance requires reconciliation; charge=" + reserved.getId()
                            + ", externalReference=" + reserved.getC6ExternalReferenceId()
                            + ". Reuse the same Idempotency-Key; do not create another attempt", exception);
        }
    }

    private ChargeResponseDTO replay(Charge charge, ChargeRequestDTO request) {
        if (!charge.getCustomer().getId().equals(request.customerId())
                || !charge.getPet().getId().equals(request.petId())
                || !sameItems(charge, request)
                || !charge.getServiceDate().equals(request.serviceDate())
                || !charge.getDueDate().equals(request.dueDate())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Idempotency-Key already used for a different request");
        }
        if (charge.getC6BankSlipId() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Issuance in progress or requires reconciliation; charge=" + charge.getId()
                            + ", externalReference=" + charge.getC6ExternalReferenceId());
        }
        return toResponse(charge);
    }

    private Charge reserve(ChargeRequestDTO request, String idempotencyKey) {
        if (!request.isSelectionValid()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Select services");
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
        var pet = petRepository.findLockedById(request.petId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found"));
        var service = serviceRepository.findById(request.selectedItems().getFirst().serviceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
        if (!pet.getCustomer().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pet does not belong to this customer");
        }

        var lines = request.selectedItems().stream().map(item -> {
            if (item.quantity()<1 || item.quantity()>100) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid quantity");
            var selected = serviceRepository.findById(item.serviceId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Service not found"));
            return new com.example.imperiodogapi.entities.ChargeLine(selected.getId(),selected.getName(),item.quantity(),selected.getPrice());
        }).toList();
        var total = lines.stream().map(line -> line.getUnitPrice().multiply(java.math.BigDecimal.valueOf(line.getQuantity())))
                .reduce(java.math.BigDecimal.ZERO,java.math.BigDecimal::add);
        if (total.compareTo(new java.math.BigDecimal("99999999.99"))>0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Total exceeds limit");
        Charge charge = Charge.builder()
                .customer(customer)
                .pet(pet)
                .service(service)
                .amount(total).lines(new java.util.ArrayList<>(lines))
                .serviceDate(request.serviceDate())
                .dueDate(request.dueDate())
                .status(ChargeStatus.PENDING)
                .idempotencyKey(idempotencyKey)
                .issuanceState("ISSUING")
                .customerNameSnapshot(customer.getUser().getName())
                .petNameSnapshot(pet.getName())
                .serviceNameSnapshot(service.getName())
                .c6ExternalReferenceId(C6BankService.newExternalReferenceId())
                .build();
        // Materialize payer data before leaving the transaction (open-in-view is disabled).
        customer.getUser().getStreetNumber();
        return chargeRepository.saveAndFlush(charge);
    }

    private boolean sameItems(Charge charge, ChargeRequestDTO request) {
        var expected = request.selectedItems();
        if (charge.getLines().isEmpty()) return expected.size()==1 && expected.getFirst().quantity()==1 && charge.getService().getId().equals(expected.getFirst().serviceId());
        return charge.getLines().stream().map(l -> new ChargeRequestDTO.Item(l.getServiceId(),l.getQuantity())).toList().equals(expected);
    }

    private void attachBoleto(Charge charge, C6BankService.Boleto boleto) {
        if (boleto.id() == null || boleto.id().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Missing C6 boleto id");
        }
        charge.setC6BankSlipId(boleto.id());
        charge.setBarcode(boleto.barcode());
        charge.setDigitableLine(boleto.digitableLine());
        charge.setIssuanceState("ISSUED");
        if (charge.getStatus() != ChargeStatus.PAID && charge.getStatus() != ChargeStatus.CANCELED) {
            if ("PAID".equalsIgnoreCase(boleto.status())) {
                charge.setStatus(ChargeStatus.PAID);
                charge.setPaymentDate(boleto.paymentDate());
            } else if ("CANCELED".equalsIgnoreCase(boleto.status()) || "CANCELLED".equalsIgnoreCase(boleto.status())) {
                charge.setStatus(ChargeStatus.CANCELED);
            }
        }
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public ChargeResponseDTO reconcile(Long chargeId, String bankSlipId) {
        C6BankService.Boleto boleto = c6BankService.getBoleto(bankSlipId);
        return transactions.execute(tx -> {
            Charge charge = chargeRepository.findLockedById(chargeId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Charge not found"));
            if (!bankSlipId.equals(boleto.id())
                    || charge.getC6ExternalReferenceId() == null
                    || !charge.getC6ExternalReferenceId().equals(boleto.externalReferenceId())
                    || boleto.amount() == null || charge.getAmount().compareTo(boleto.amount()) != 0
                    || !charge.getDueDate().equals(boleto.dueDate())
                    || !charge.getCustomer().getUser().getCpf().equals(boleto.payerTaxId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bank boleto does not match the reserved charge");
            }
            if (charge.getC6BankSlipId() != null && !bankSlipId.equals(charge.getC6BankSlipId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Charge already linked to a different boleto");
            }
            attachBoleto(charge, boleto);
            return toResponse(chargeRepository.saveAndFlush(charge));
        });
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
        return new ChargeResponseDTO(charge.getId(), charge.getCustomerNameSnapshot() == null
                ? charge.getCustomer().getUser().getName() : charge.getCustomerNameSnapshot(),
                charge.getPetNameSnapshot() == null ? charge.getPet().getName() : charge.getPetNameSnapshot(),
                charge.getServiceNameSnapshot() == null ? charge.getService().getName() : charge.getServiceNameSnapshot(), charge.getAmount(),
                charge.getServiceDate(), charge.getDueDate(), charge.getPaymentDate(),
                charge.getStatus(), ticketUrl, charge.getCustomer().getId(),
                charge.getBarcode(), charge.getDigitableLine(), charge.getIssuanceState(),
                charge.getC6ExternalReferenceId(), java.util.List.copyOf(charge.getLines()));
    }
}
