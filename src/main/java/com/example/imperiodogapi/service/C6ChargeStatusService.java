package com.example.imperiodogapi.service;

import com.example.imperiodogapi.entities.Charge;
import com.example.imperiodogapi.entities.enums.ChargeStatus;
import com.example.imperiodogapi.repository.ChargeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;

@Service
public class C6ChargeStatusService {

    private static final Logger LOGGER = LoggerFactory.getLogger(C6ChargeStatusService.class);
    private static final ZoneId SAO_PAULO = ZoneId.of("America/Sao_Paulo");

    private final C6BankService c6BankService;
    private final ChargeRepository chargeRepository;
    private final TransactionTemplate transactionTemplate;

    public C6ChargeStatusService(C6BankService c6BankService, ChargeRepository chargeRepository,
                                 PlatformTransactionManager transactionManager) {
        this.c6BankService = c6BankService;
        this.chargeRepository = chargeRepository;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Scheduled(fixedDelayString = "${c6.status-sync-interval-ms:300000}",
            initialDelayString = "${c6.status-sync-initial-delay-ms:60000}")
    public void synchronizeOpenCharges() {
        List<String> bankSlipIds = chargeRepository.findByC6BankSlipIdIsNotNullAndStatusIn(
                        List.of(ChargeStatus.PENDING, ChargeStatus.PAYMENT_IN_PROCESS, ChargeStatus.OVERDUE))
                .stream()
                .map(Charge::getC6BankSlipId)
                .toList();
        bankSlipIds.forEach(bankSlipId -> {
            try {
                synchronize(bankSlipId);
            } catch (RestClientException | ResponseStatusException exception) {
                LOGGER.error("Could not synchronize C6 Bank boleto {}", bankSlipId, exception);
            }
        });
        markOverdueCharges();
    }

    public void synchronize(String bankSlipId) {
        C6BankService.Boleto boleto = c6BankService.getBoleto(bankSlipId);
        transactionTemplate.executeWithoutResult(status -> updateLocalCharge(boleto));
    }

    private void updateLocalCharge(C6BankService.Boleto boleto) {
        List<Charge> matchingCharges = chargeRepository.findByC6BankSlipId(boleto.id());
        if (matchingCharges.size() != 1) {
            LOGGER.warn("Expected one charge for C6 Bank boleto {}, found {}",
                    boleto.id(), matchingCharges.size());
            return;
        }
        Charge charge = matchingCharges.getFirst();
        if (charge.getStatus() == ChargeStatus.PAID || charge.getStatus() == ChargeStatus.CANCELED) {
            return;
        }

        ChargeStatus newStatus = mapStatus(boleto.status(), charge.getDueDate());
        if (newStatus == null) {
            LOGGER.warn("Ignoring unsupported C6 Bank boleto status '{}' for {}",
                    boleto.status(), boleto.id());
            return;
        }
        charge.setStatus(newStatus);
        if (newStatus == ChargeStatus.PAID) {
            charge.setPaymentDate(boleto.paymentDate() == null
                    ? LocalDateTime.now(SAO_PAULO) : boleto.paymentDate());
        }
        chargeRepository.save(charge);
    }

    private void markOverdueCharges() {
        transactionTemplate.executeWithoutResult(status -> {
            List<Charge> overdue = chargeRepository.findByStatusInAndDueDateBefore(
                    List.of(ChargeStatus.PENDING, ChargeStatus.PAYMENT_IN_PROCESS),
                    LocalDate.now(SAO_PAULO));
            overdue.forEach(charge -> charge.setStatus(ChargeStatus.OVERDUE));
            chargeRepository.saveAll(overdue);
        });
    }

    private ChargeStatus mapStatus(String providerStatus, LocalDate dueDate) {
        if (providerStatus == null) {
            return null;
        }
        return switch (providerStatus.toUpperCase(Locale.ROOT)) {
            case "CREATED" -> dueDate.isBefore(LocalDate.now(SAO_PAULO))
                    ? ChargeStatus.OVERDUE : ChargeStatus.PENDING;
            case "PAID" -> ChargeStatus.PAID;
            case "CANCELLED", "CANCELED" -> ChargeStatus.CANCELED;
            default -> null;
        };
    }
}
