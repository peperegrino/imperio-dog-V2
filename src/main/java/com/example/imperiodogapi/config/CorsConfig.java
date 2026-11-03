package com.example.imperiodogapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") List<String> allowedOrigins,
            @Value("${app.cors.allowed-origin-patterns:}") List<String> allowedOriginPatterns) {

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(clean(allowedOrigins));
        List<String> patterns = clean(allowedOriginPatterns);
        if (!patterns.isEmpty()) {
            config.setAllowedOriginPatterns(patterns);
        }
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        // Permite ao frontend ler o nome do arquivo no download do PDF do boleto
        config.setExposedHeaders(List.of("Content-Disposition"));
        // JWT trafega no header Authorization; nao ha cookies, entao credenciais ficam desligadas
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    private static List<String> clean(List<String> values) {
        return values.stream().map(String::trim).filter(value -> !value.isEmpty()).toList();
    }
}
