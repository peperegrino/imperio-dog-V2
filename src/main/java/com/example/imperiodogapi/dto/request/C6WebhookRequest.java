package com.example.imperiodogapi.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import tools.jackson.databind.JsonNode;

public record C6WebhookRequest(
        @NotBlank @Pattern(regexp = "(?i)BANK_SLIP") String service,
        @Size(max = 255) @JsonProperty("external_id") String externalId,
        JsonNode information
) {
    @jakarta.validation.constraints.AssertTrue(message = "A boleto id is required")
    @JsonIgnore
    public boolean isBoletoIdPresent() {
        if (externalId != null && !externalId.isBlank()) {
            return true;
        }
        if (information == null) {
            return false;
        }
        if (information.isTextual()) {
            return !information.asText().isBlank();
        }
        String id = information.path("id").asText(null);
        return id != null && !id.isBlank();
    }
}
