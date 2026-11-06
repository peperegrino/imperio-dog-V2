package com.example.imperiodogapi.controller;

import com.example.imperiodogapi.dto.C6WebhookRequest;
import com.example.imperiodogapi.service.C6WebhookService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping({"/webhooks/c6", "/api/webhooks/c6"})
public class C6WebhookController {

    private final C6WebhookService webhookService;

    public C6WebhookController(C6WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping
    public ResponseEntity<Void> receiveNotification(
            @RequestParam(name = "token", required = false) String token,
            @Valid @RequestBody C6WebhookRequest notification) {
        if (!webhookService.isValidToken(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid C6 Bank webhook token");
        }
        webhookService.processNotification(notification);
        return ResponseEntity.ok().build();
    }
}
