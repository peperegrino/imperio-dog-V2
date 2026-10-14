package com.example.imperiodogapi.service;

import com.example.imperiodogapi.dto.CustomerRequestDTO;
import com.example.imperiodogapi.dto.CustomerResponseDTO;
import com.example.imperiodogapi.entities.Customer;
import com.example.imperiodogapi.entities.User;
import com.example.imperiodogapi.entities.enums.Role;
import com.example.imperiodogapi.repository.CustomerRepository;
import com.example.imperiodogapi.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class CustomerService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(UserRepository userRepository, CustomerRepository customerRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CustomerResponseDTO createCustomer(CustomerRequestDTO request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String cpf = request.cpf().replaceAll("\\D", "");
        if (!isValidCpf(cpf)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF is invalid");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        if (userRepository.existsByCpf(cpf)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF is already registered");
        }

        User user = User.builder()
                .name(request.name().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .cpf(cpf)
                .zipCode(request.zipCode().replaceAll("\\D", ""))
                .streetName(request.streetName().trim())
                .streetNumber(request.streetNumber().trim())
                .neighborhood(request.neighborhood().trim())
                .city(request.city().trim())
                .federalUnit(request.federalUnit().trim().toUpperCase(Locale.ROOT))
                .role(Role.CLIENT)
                .build();
        user = userRepository.save(user);
        Customer customer = customerRepository.save(Customer.builder().user(user).build());
        return toResponse(customer);
    }

    @Transactional(readOnly = true)
    public CustomerResponseDTO findByEmail(String email) {
        Customer customer = customerRepository.findByUserEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        return toResponse(customer);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponseDTO> findAll() {
        return customerRepository.findAll().stream().map(this::toResponse).toList();
    }

    private CustomerResponseDTO toResponse(Customer customer) {
        User user = customer.getUser();
        return new CustomerResponseDTO(customer.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getCpf());
    }

    private boolean isValidCpf(String cpf) {
        if (cpf == null || !cpf.matches("\\d{11}") || cpf.chars().distinct().count() == 1) {
            return false;
        }
        int firstDigit = cpfDigit(cpf, 9);
        int secondDigit = cpfDigit(cpf, 10);
        return cpf.charAt(9) - '0' == firstDigit && cpf.charAt(10) - '0' == secondDigit;
    }

    private int cpfDigit(String cpf, int length) {
        int sum = 0;
        for (int index = 0; index < length; index++) {
            sum += (cpf.charAt(index) - '0') * (length + 1 - index);
        }
        int remainder = (sum * 10) % 11;
        return remainder == 10 ? 0 : remainder;
    }
}
