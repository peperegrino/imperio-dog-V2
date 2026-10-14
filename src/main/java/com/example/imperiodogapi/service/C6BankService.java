package com.example.imperiodogapi.service;

import com.example.imperiodogapi.entities.Charge;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyStore;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class C6BankService {

    private static final Logger LOGGER = LoggerFactory.getLogger(C6BankService.class);
    private static final char[] REFERENCE_ALPHABET =
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final String apiBaseUrl;
    private final String clientId;
    private final String clientSecret;
    private final String certificatePath;
    private final String certificatePassword;
    private final String billingScheme;
    private volatile RestClient restClient;
    private volatile String accessToken;
    private volatile long accessTokenExpiresAt;

    public C6BankService(@Value("${c6.api-base-url}") String apiBaseUrl,
                         @Value("${c6.client-id:}") String clientId,
                         @Value("${c6.client-secret:}") String clientSecret,
                         @Value("${c6.certificate-path:}") String certificatePath,
                         @Value("${c6.certificate-password:}") String certificatePassword,
                         @Value("${c6.billing-scheme:21}") String billingScheme) {
        this.apiBaseUrl = apiBaseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.certificatePath = certificatePath;
        this.certificatePassword = certificatePassword;
        this.billingScheme = billingScheme;
    }

    public static String newExternalReferenceId() {
        char[] reference = new char[10];
        for (int index = 0; index < reference.length; index++) {
            reference[index] = REFERENCE_ALPHABET[SECURE_RANDOM.nextInt(REFERENCE_ALPHABET.length)];
        }
        return new String(reference);
    }

    public Boleto createBoleto(Charge charge) {
        var payer = charge.getCustomer().getUser();
        Map<String, Object> address = new LinkedHashMap<>();
        address.put("street", payer.getStreetName());
        address.put("number", parseStreetNumber(payer.getStreetNumber()));
        address.put("city", payer.getCity());
        address.put("state", payer.getFederalUnit());
        address.put("zip_code", payer.getZipCode());

        Map<String, Object> payerRequest = new LinkedHashMap<>();
        payerRequest.put("name", payer.getName());
        payerRequest.put("tax_id", payer.getCpf());
        payerRequest.put("email", payer.getEmail());
        payerRequest.put("address", address);

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("external_reference_id", charge.getC6ExternalReferenceId());
        request.put("amount", charge.getAmount());
        request.put("due_date", charge.getDueDate().toString());
        request.put("billing_scheme", billingScheme);
        request.put("payer", payerRequest);

        JsonNode response;
        try {
            response = apiClient().post()
                    .uri("/v1/bank_slips")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not create boleto with C6 Bank", exception);
        }
        if (response == null || !response.hasNonNull("id")) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "C6 Bank returned an invalid boleto response");
        }
        return new Boleto(response.path("id").asText(),
                response.path("status").asText("CREATED"),
                response.path("bar_code").asText(null),
                response.path("digitable_line").asText(null),
                null);
    }

    public Boleto getBoleto(String bankSlipId) {
        JsonNode response;
        try {
            response = apiClient().get()
                    .uri("/v1/bank_slips/{id}", bankSlipId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not retrieve C6 Bank boleto status", exception);
        }
        if (response == null || !response.hasNonNull("id")) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "C6 Bank returned an invalid boleto status response");
        }
        LocalDateTime paymentDate = null;
        String date = response.path("payment_date").asText(null);
        if ((date == null || date.isBlank()) && response.path("payments").isArray()
                && !response.path("payments").isEmpty()) {
            date = response.path("payments").get(0).path("date").asText(null);
        }
        if (date != null && !date.isBlank()) {
            paymentDate = LocalDate.parse(date).atStartOfDay();
        }
        return new Boleto(response.path("id").asText(),
                response.path("status").asText(),
                response.path("bar_code").asText(null),
                response.path("digitable_line").asText(null),
                paymentDate);
    }

    public byte[] downloadBoleto(String bankSlipId) {
        byte[] pdf;
        try {
            pdf = apiClient().get()
                    .uri("/v1/bank_slips/{id}/pdf", bankSlipId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken())
                    .accept(MediaType.APPLICATION_PDF)
                    .retrieve()
                    .body(byte[].class);
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not download C6 Bank boleto", exception);
        }
        if (pdf == null || pdf.length == 0 || pdf[0] != '%' || pdf.length < 4
                || pdf[1] != 'P' || pdf[2] != 'D' || pdf[3] != 'F') {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "C6 Bank returned an invalid boleto PDF");
        }
        return pdf;
    }

    public void ensureBankSlipWebhook(String callbackUrl) {
        JsonNode existing = null;
        try {
            existing = apiClient().get()
                    .uri(uriBuilder -> uriBuilder.path("/v1/webhooks").queryParam("service", "BANK_SLIP").build())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException exception) {
            if (!exception.getStatusCode().equals(HttpStatus.NOT_FOUND)) {
                throw exception;
            }
        }
        if (existing != null && existing.hasNonNull("url")) {
            if (callbackUrl.equals(existing.path("url").asText())) {
                LOGGER.info("C6 Bank boleto webhook is already registered");
                return;
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A different C6 Bank boleto webhook is already registered for this account");
        }

        apiClient().post()
                .uri("/v1/webhooks")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("url", callbackUrl, "service", "BANK_SLIP"))
                .retrieve()
                .toBodilessEntity();
        LOGGER.info("C6 Bank boleto webhook registered");
    }

    private String getAccessToken() {
        if (accessToken != null && System.nanoTime() < accessTokenExpiresAt) {
            return accessToken;
        }
        synchronized (this) {
            if (accessToken != null && System.nanoTime() < accessTokenExpiresAt) {
                return accessToken;
            }
            requireCredentials();
            String body = "client_id=" + encode(clientId)
                    + "&client_secret=" + encode(clientSecret)
                    + "&grant_type=client_credentials";
            try {
                JsonNode response = apiClient().post()
                        .uri("/v1/auth")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .body(body)
                        .retrieve()
                        .body(JsonNode.class);
                if (response == null || !response.hasNonNull("access_token")) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                            "C6 Bank returned an invalid authentication response");
                }
                long expiresIn = response.path("expires_in").asLong(600);
                accessToken = response.path("access_token").asText();
                accessTokenExpiresAt = System.nanoTime()
                        + Math.max(1, expiresIn - 30) * 1_000_000_000L;
                return accessToken;
            } catch (RestClientException exception) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Could not authenticate with C6 Bank", exception);
            }
        }
    }

    private RestClient apiClient() {
        RestClient client = restClient;
        if (client != null) {
            return client;
        }
        synchronized (this) {
            if (restClient == null) {
                requireCredentials();
                try {
                    char[] password = certificatePassword.toCharArray();
                    KeyStore keyStore = KeyStore.getInstance("PKCS12");
                    try (InputStream input = Files.newInputStream(Path.of(certificatePath))) {
                        keyStore.load(input, password);
                    }
                    KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(
                            KeyManagerFactory.getDefaultAlgorithm());
                    keyManagerFactory.init(keyStore, password);
                    SSLContext sslContext = SSLContext.getInstance("TLS");
                    sslContext.init(keyManagerFactory.getKeyManagers(), null, new SecureRandom());

                    HttpClient httpClient = HttpClient.newBuilder()
                            .sslContext(sslContext)
                            .connectTimeout(java.time.Duration.ofSeconds(10))
                            .build();
                    JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
                    requestFactory.setReadTimeout(java.time.Duration.ofSeconds(30));
                    restClient = RestClient.builder()
                            .baseUrl(URI.create(apiBaseUrl).toString())
                            .requestFactory(requestFactory)
                            .defaultHeader("partner-software-name", "Imperio Dog")
                            .defaultHeader("partner-software-version", "1.0.0")
                            .build();
                } catch (Exception exception) {
                    throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                            "Could not load the C6 Bank PKCS#12 client certificate", exception);
                }
            }
            return restClient;
        }
    }

    private void requireCredentials() {
        if (clientId.isBlank() || clientSecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Configure C6_CLIENT_ID and C6_CLIENT_SECRET to use boleto services");
        }
        if (certificatePath.isBlank() || certificatePassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Configure the C6 Bank PKCS#12 certificate path and password to use boleto services");
        }
    }

    private int parseStreetNumber(String streetNumber) {
        try {
            return Integer.parseInt(streetNumber);
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "The billing address street number must be numeric for C6 Bank boletos", exception);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    public record Boleto(String id, String status, String barcode, String digitableLine,
                         LocalDateTime paymentDate) {
    }
}
