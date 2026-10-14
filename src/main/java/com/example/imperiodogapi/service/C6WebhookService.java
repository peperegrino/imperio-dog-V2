package com.example.imperiodogapi.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class C6WebhookService {

    private final byte[] webhookToken;
    private final ObjectMapper objectMapper;
    private final C6ChargeStatusService statusService;

    public C6WebhookService(@Value("${c6.webhook-token:}") String webhookToken,
                            ObjectMapper objectMapper,
                            C6ChargeStatusService statusService) {
        this.webhookToken = webhookToken.getBytes(StandardCharsets.UTF_8);
        this.objectMapper = objectMapper;
        this.statusService = statusService;
    }

    public boolean isValidToken(String suppliedToken) {
        return suppliedToken != null && webhookToken.length > 0
                && MessageDigest.isEqual(webhookToken, suppliedToken.getBytes(StandardCharsets.UTF_8));
    }

    public void processNotification(JsonNode notification) {
        if (!"BANK_SLIP".equalsIgnoreCase(notification.path("service").asText())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unsupported C6 Bank webhook service");
        }

        JsonNode information = notification.path("information");
        if (information.isTextual()) {
            try {
                information = objectMapper.readTree(information.asText());
            } catch (Exception exception) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid C6 Bank boleto notification information", exception);
            }
        }
        String bankSlipId = information.path("id").asText(null);
        if (bankSlipId == null || bankSlipId.isBlank()) {
            bankSlipId = notification.path("external_id").asText(null);
        }
        if (bankSlipId == null || bankSlipId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Missing C6 Bank boleto id in webhook notification");
        }
        statusService.synchronize(bankSlipId);
    }
}
