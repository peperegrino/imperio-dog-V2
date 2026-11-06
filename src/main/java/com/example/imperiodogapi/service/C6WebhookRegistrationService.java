package com.example.imperiodogapi.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class C6WebhookRegistrationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(C6WebhookRegistrationService.class);

    private final C6BankService c6BankService;
    private final String webhookUrl;
    private final String webhookToken;

    public C6WebhookRegistrationService(C6BankService c6BankService,
                                        @Value("${c6.webhook-url:}") String webhookUrl,
                                        @Value("${c6.webhook-token:}") String webhookToken) {
        this.c6BankService = c6BankService;
        this.webhookUrl = webhookUrl;
        this.webhookToken = webhookToken;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void registerWebhook() {
        if (webhookUrl.isBlank()) {
            LOGGER.info("C6 Bank webhook URL is not configured; scheduled status synchronization remains enabled");
            return;
        }
        if (webhookToken.isBlank()) {
            LOGGER.error("C6_WEBHOOK_URL is configured but C6_WEBHOOK_TOKEN is missing; webhook registration skipped");
            return;
        }
        String callbackUrl = UriComponentsBuilder.fromUriString(webhookUrl)
                .queryParam("token", webhookToken)
                .build()
                .encode()
                .toUriString();
        try {
            c6BankService.ensureBankSlipWebhook(callbackUrl);
        } catch (RestClientException | ResponseStatusException exception) {
            LOGGER.error("Could not register the C6 Bank boleto webhook; scheduled status synchronization remains enabled",
                    exception);
        }
    }
}
