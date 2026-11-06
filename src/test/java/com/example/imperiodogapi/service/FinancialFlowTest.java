package com.example.imperiodogapi.service;

import com.example.imperiodogapi.dto.*;
import com.example.imperiodogapi.entities.*;
import com.example.imperiodogapi.entities.enums.*;
import com.example.imperiodogapi.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
public class FinancialFlowTest {
    @Autowired ChargeService charges;
    @Autowired ChargeRepository chargeRepository;
    @Autowired CustomerRepository customers;
    @Autowired PetRepository pets;
    @Autowired ServiceRepository services;
    @Autowired UserRepository users;
    @Autowired PetService petService;
    @Autowired C6ChargeStatusService statusService;
    @Autowired PlatformTransactionManager transactionManager;
    @MockitoBean C6BankService bank;
    ChargeRequestDTO request;
    static final String KEY = "test-idempotency-0001";

    @BeforeEach
    void setup() {
        chargeRepository.deleteAll(); pets.deleteAll(); customers.deleteAll(); users.deleteAll(); services.deleteAll();
        User user = User.builder().name("Maria").email("maria@example.com").password("unused")
                .cpf("12345678909").role(Role.CLIENT).streetName("Rua A").streetNumber("10")
                .city("Sao Paulo").federalUnit("SP").zipCode("01001000").build();
        Customer customer = customers.saveAndFlush(Customer.builder().user(user).build());
        Pet pet = pets.saveAndFlush(Pet.builder().name("Rex").customer(customer).build());
        ServiceEntity service = services.saveAndFlush(ServiceEntity.builder().name("Banho")
                .price(new BigDecimal("89.90")).build());
        LocalDate today = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        request = new ChargeRequestDTO(customer.getId(), pet.getId(), service.getId(), today, today.plusDays(7));
    }

    C6BankService.Boleto boleto(String reference, String status) {
        return new C6BankService.Boleto("bank-1", status, "barcode", "line", request.serviceDate().atStartOfDay(),
                reference, new BigDecimal("89.90"), request.dueDate(), "12345678909");
    }

    @Test
    void repeatedRequestEmitsOnceAndPreservesHistory() {
        when(bank.createBoleto(any())).thenAnswer(call -> {
            Charge charge = call.getArgument(0);
            assertFalse(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive());
            assertTrue(chargeRepository.findById(charge.getId()).isPresent());
            return boleto(charge.getC6ExternalReferenceId(), "CREATED");
        });
        var first = charges.createCharge(request, KEY);
        var tx = new TransactionTemplate(transactionManager);
        tx.executeWithoutResult(s -> {
            services.findById(request.serviceId()).orElseThrow().setName("Novo nome");
            pets.findById(request.petId()).orElseThrow().setName("Outro nome");
        });
        var replay = charges.createCharge(request, KEY);
        assertEquals(first.id(), replay.id());
        assertEquals("Banho", replay.serviceName());
        assertEquals("Rex", replay.petName());
        assertEquals("ISSUED", replay.issuanceState());
        verify(bank, times(1)).createBoleto(any());
        var changed = new ChargeRequestDTO(request.customerId(), request.petId(), request.serviceId(),
                request.serviceDate(), request.dueDate().plusDays(1));
        assertEquals(409, assertThrows(ResponseStatusException.class,
                () -> charges.createCharge(changed, KEY)).getStatusCode().value());
    }

    @Test
    void ambiguousFailureRemainsDurableAndCanBeReconciledWithoutReissuing() {
        when(bank.createBoleto(any())).thenThrow(new IllegalStateException("timeout after bank accepted"));
        assertThrows(ResponseStatusException.class, () -> charges.createCharge(request, KEY));
        Charge charge = chargeRepository.findByIdempotencyKey(KEY).orElseThrow();
        assertEquals("UNKNOWN", charge.getIssuanceState());
        assertThrows(ResponseStatusException.class, () -> charges.createCharge(request, KEY));
        verify(bank, times(1)).createBoleto(any());
        when(bank.getBoleto("bank-1")).thenReturn(boleto("WRONG", "CREATED"));
        assertThrows(ResponseStatusException.class, () -> charges.reconcile(charge.getId(), "bank-1"));
        assertNull(chargeRepository.findById(charge.getId()).orElseThrow().getC6BankSlipId());
        when(bank.getBoleto("bank-1")).thenReturn(boleto(charge.getC6ExternalReferenceId(), "CREATED"));
        assertEquals("ISSUED", charges.reconcile(charge.getId(), "bank-1").issuanceState());
        assertEquals(charge.getId(), charges.createCharge(request, KEY).id());
    }

    @Test
    void concurrentRequestCannotEmitAnotherBoleto() throws Exception {
        CountDownLatch entered = new CountDownLatch(1), release = new CountDownLatch(1);
        when(bank.createBoleto(any())).thenAnswer(call -> {
            entered.countDown();
            if (!release.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("test timed out");
            return boleto(((Charge) call.getArgument(0)).getC6ExternalReferenceId(), "CREATED");
        });
        try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
            Future<ChargeResponseDTO> first = executor.submit(() -> charges.createCharge(request, KEY));
            try {
                assertTrue(entered.await(10, TimeUnit.SECONDS));
                assertEquals(409, assertThrows(ResponseStatusException.class,
                        () -> charges.createCharge(request, KEY)).getStatusCode().value());
            } finally { release.countDown(); }
            assertNotNull(first.get(10, TimeUnit.SECONDS).id());
        }
        assertEquals(1, chargeRepository.count());
        verify(bank, times(1)).createBoleto(any());
    }

    @Test
    void paidStatusSurvivesDuplicateAndStaleNotificationsAndForeignUserIsDenied() {
        when(bank.createBoleto(any())).thenReturn(boleto("unused", "CREATED"));
        var charge = charges.createCharge(request, KEY);
        when(bank.getBoleto("bank-1")).thenReturn(boleto(charge.externalReferenceId(), "PAID"));
        statusService.synchronize("bank-1"); statusService.synchronize("bank-1");
        when(bank.getBoleto("bank-1")).thenReturn(boleto(charge.externalReferenceId(), "CREATED"));
        statusService.synchronize("bank-1");
        var paid = chargeRepository.findById(charge.id()).orElseThrow();
        assertEquals(ChargeStatus.PAID, paid.getStatus());
        assertEquals(request.serviceDate().atStartOfDay(), paid.getPaymentDate());
        assertEquals(403, assertThrows(ResponseStatusException.class,
                () -> charges.findByIdForUser(charge.id(), "other@example.com", false)).getStatusCode().value());
        assertEquals(403, assertThrows(ResponseStatusException.class,
                () -> charges.findBankSlipIdForUser(charge.id(), "other@example.com", false)).getStatusCode().value());
        assertEquals(409, assertThrows(ResponseStatusException.class,
                () -> petService.update(request.petId(), new PetRequestDTO("Rex", "Dog", "Mixed", -1L)))
                .getStatusCode().value());
    }

    @Test
    void staleDatabaseWriteCannotOverwritePayment() {
        when(bank.createBoleto(any())).thenReturn(boleto("unused", "CREATED"));
        var response = charges.createCharge(request, KEY);
        Charge stale = chargeRepository.findById(response.id()).orElseThrow();
        when(bank.getBoleto("bank-1")).thenReturn(boleto(response.externalReferenceId(), "PAID"));
        statusService.synchronize("bank-1");
        stale.setStatus(ChargeStatus.OVERDUE);
        assertThrows(org.springframework.dao.OptimisticLockingFailureException.class,
                () -> chargeRepository.saveAndFlush(stale));
        assertEquals(ChargeStatus.PAID, chargeRepository.findById(response.id()).orElseThrow().getStatus());
    }
}
