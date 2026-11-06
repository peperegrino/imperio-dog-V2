package com.example.imperiodogapi.config;

import com.example.imperiodogapi.entities.User;
import com.example.imperiodogapi.entities.enums.Role;
import com.example.imperiodogapi.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Cria o primeiro administrador quando o banco ainda nao possui nenhum ADMIN.
 * Usa ADMIN_EMAIL / ADMIN_PASSWORD (e opcionalmente ADMIN_NAME). Depois que existir um admin,
 * nada e alterado, entao reiniciar a aplicacao nunca redefine a senha. Apos o primeiro boot,
 * as variaveis ADMIN_* podem ser removidas do ambiente.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdminBootstrap.class);
    private static final int MIN_PASSWORD_LENGTH = 12;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String name;
    private final String email;
    private final String password;

    public AdminBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          @Value("${app.bootstrap-admin.name:Administrador}") String name,
                          @Value("${app.bootstrap-admin.email:}") String email,
                          @Value("${app.bootstrap-admin.password:}") String password) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByRole(Role.ADMIN)) {
            return;
        }
        if (email.isBlank() || password.isBlank()) {
            LOGGER.warn("Nenhum ADMIN cadastrado e ADMIN_EMAIL/ADMIN_PASSWORD nao definidos: "
                    + "ninguem conseguira usar as rotas administrativas.");
            return;
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalStateException("ADMIN_PASSWORD deve ter pelo menos " + MIN_PASSWORD_LENGTH + " caracteres");
        }
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalStateException("ADMIN_EMAIL ja pertence a um usuario que nao e ADMIN");
        }
        userRepository.save(User.builder()
                .name(name.trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(password))
                .role(Role.ADMIN)
                .build());
        LOGGER.info("Administrador inicial criado: {}", normalizedEmail);
    }
}
