package com.example.imperiodogapi.security;

import com.example.imperiodogapi.entities.enums.Role;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@Component
public class JwtTokenProvider {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String HEADER = Base64.getUrlEncoder().withoutPadding()
            .encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));

    private static final String DEV_SECRET_PREFIX = "dev-only-";

    private final ObjectMapper objectMapper;
    private final Environment environment;
    private final String secret;
    private final long expirationMillis;

    public JwtTokenProvider(ObjectMapper objectMapper,
                            Environment environment,
                            @Value("${app.jwt.secret}") String secret,
                            @Value("${app.jwt.expiration-ms:86400000}") long expirationMillis) {
        this.objectMapper = objectMapper;
        this.environment = environment;
        this.secret = secret;
        this.expirationMillis = expirationMillis;
    }

    @PostConstruct
    void validateConfiguration() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must contain at least 32 bytes");
        }
        if (secret.startsWith(DEV_SECRET_PREFIX) && environment.acceptsProfiles(Profiles.of("prod"))) {
            throw new IllegalStateException("JWT_SECRET must be set to a private value when the prod profile is active");
        }
        if (expirationMillis < 60_000) {
            throw new IllegalStateException("JWT expiration must be at least 60 seconds");
        }
    }

    public String generateToken(String email, Role role) {
        long now = Instant.now().getEpochSecond();
        Map<String, Object> claims = Map.of(
                "sub", email,
                "role", role.name(),
                "iat", now,
                "exp", now + expirationMillis / 1000
        );
        try {
            String payload = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(objectMapper.writeValueAsBytes(claims));
            String content = HEADER + "." + payload;
            return content + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(sign(content));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not create authentication token", exception);
        }
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception exception) {
            return false;
        }
    }

    /** Valida o token e devolve o e-mail (claim "sub") em uma unica leitura. */
    public Optional<String> extractEmail(String token) {
        try {
            return Optional.of(parseClaims(token).get("sub").toString());
        } catch (Exception exception) {
            return Optional.empty();
        }
    }

    public String getEmail(String token) {
        return parseClaims(token).get("sub").toString();
    }

    private Map<String, Object> parseClaims(String token) {
        try {
            String[] parts = token.split("\\.", -1);
            if (parts.length != 3) {
                throw new IllegalArgumentException("Malformed JWT");
            }
            Map<String, Object> header = objectMapper.readValue(
                    Base64.getUrlDecoder().decode(parts[0]), new TypeReference<>() { });
            if (!"HS256".equals(header.get("alg"))) {
                throw new IllegalArgumentException("Unsupported JWT algorithm");
            }
            byte[] suppliedSignature = Base64.getUrlDecoder().decode(parts[2]);
            byte[] expectedSignature = sign(parts[0] + "." + parts[1]);
            if (!MessageDigest.isEqual(expectedSignature, suppliedSignature)) {
                throw new IllegalArgumentException("Invalid JWT signature");
            }
            Map<String, Object> claims = objectMapper.readValue(
                    Base64.getUrlDecoder().decode(parts[1]), new TypeReference<>() { });
            Object subject = claims.get("sub");
            Object expiresAt = claims.get("exp");
            Object role = claims.get("role");
            if (!(subject instanceof String email) || email.isBlank()
                    || !(expiresAt instanceof Number expiration)
                    || expiration.longValue() <= Instant.now().getEpochSecond()
                    || !(role instanceof String roleName)) {
                throw new IllegalArgumentException("Invalid or expired JWT claims");
            }
            Role.valueOf(roleName);
            return claims;
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid authentication token", exception);
        }
    }

    private byte[] sign(String value) throws Exception {
        Mac mac = Mac.getInstance(HMAC_ALGORITHM);
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
        return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
    }
}
