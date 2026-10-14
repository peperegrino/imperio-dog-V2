package com.example.imperiodogapi.service;

import com.example.imperiodogapi.dto.AuthRequestDTO;
import com.example.imperiodogapi.dto.AuthResponseDTO;
import com.example.imperiodogapi.dto.CustomerRequestDTO;
import com.example.imperiodogapi.dto.CustomerResponseDTO;
import com.example.imperiodogapi.dto.PetRequestDTO;
import com.example.imperiodogapi.dto.PetResponseDTO;
import com.example.imperiodogapi.dto.ServiceRequestDTO;
import com.example.imperiodogapi.dto.ServiceResponseDTO;
import com.example.imperiodogapi.entities.Customer;
import com.example.imperiodogapi.entities.Pet;
import com.example.imperiodogapi.entities.ServiceEntity;
import com.example.imperiodogapi.entities.User;
import com.example.imperiodogapi.entities.enums.Role;
import com.example.imperiodogapi.repository.CustomerRepository;
import com.example.imperiodogapi.repository.PetRepository;
import com.example.imperiodogapi.repository.ServiceRepository;
import com.example.imperiodogapi.repository.UserRepository;
import com.example.imperiodogapi.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceLayerTests {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private PetRepository petRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @InjectMocks
    private CustomerService customerService;

    @InjectMocks
    private PetService petService;

    @InjectMocks
    private ServiceEntityService serviceEntityService;

    @Test
    void authServiceShouldGenerateTokenForValidCredentials() {
        AuthRequestDTO request = new AuthRequestDTO("cliente@email.com", "123456");
        User user = User.builder().email("cliente@email.com").role(Role.CLIENT).build();

        when(authenticationManager.authenticate(any())).thenReturn(mock(Authentication.class));
        when(userRepository.findByEmail("cliente@email.com")).thenReturn(Optional.of(user));
        when(tokenProvider.generateToken("cliente@email.com", Role.CLIENT)).thenReturn("jwt-token");

        AuthResponseDTO response = authService.login(request);

        assertEquals("jwt-token", response.token());
        assertEquals("Bearer", response.type());
        assertEquals("ROLE_CLIENT", response.role());
    }

    @Test
    void authServiceShouldRejectInvalidCredentials() {
        AuthRequestDTO request = new AuthRequestDTO("cliente@email.com", "wrong-password");
        when(authenticationManager.authenticate(any())).thenThrow(new AuthenticationException("invalid") {
        });

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.login(request));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void customerServiceShouldCreateCustomerSuccessfully() {
        CustomerRequestDTO request = new CustomerRequestDTO(
                "Maria Silva",
                "maria@email.com",
                "Senha@123456",
                "11999999999",
                "12345678909",
                "01001000",
                "Rua das Flores",
                "123",
                "Centro",
                "Sao Paulo",
                "SP"
        );

        when(userRepository.existsByEmail("maria@email.com")).thenReturn(false);
        when(userRepository.existsByCpf("12345678909")).thenReturn(false);
        when(passwordEncoder.encode("Senha@123456")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> {
            Customer customer = invocation.getArgument(0);
            customer.setId(10L);
            return customer;
        });

        CustomerResponseDTO response = customerService.createCustomer(request);

        assertEquals(10L, response.id());
        assertEquals("Maria Silva", response.name());
        assertEquals("maria@email.com", response.email());
        assertEquals("12345678909", response.cpf());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void petServiceShouldCreateAndFindPet() {
        Customer customer = Customer.builder().id(7L).build();
        PetRequestDTO request = new PetRequestDTO("Rex", "Cachorro", "Vira-lata", 7L);

        when(customerRepository.findById(7L)).thenReturn(Optional.of(customer));
        when(petRepository.save(any(Pet.class))).thenAnswer(invocation -> {
            Pet pet = invocation.getArgument(0);
            pet.setId(15L);
            return pet;
        });

        PetResponseDTO created = petService.create(request);
        assertEquals("Rex", created.name());
        assertEquals(7L, created.customerId());

        when(petRepository.findById(15L)).thenReturn(Optional.of(Pet.builder().id(15L).name("Rex").species("Cachorro").breed("Vira-lata").customer(customer).build()));
        PetResponseDTO found = petService.findById(15L);

        assertEquals(15L, found.id());
        assertEquals("Rex", found.name());
    }

    @Test
    void serviceEntityServiceShouldCreateAndReturnService() {
        ServiceRequestDTO request = new ServiceRequestDTO("Banho e tosa", "Completo", new BigDecimal("89.90"));

        when(serviceRepository.save(any(ServiceEntity.class))).thenAnswer(invocation -> {
            ServiceEntity service = invocation.getArgument(0);
            service.setId(3L);
            return service;
        });

        ServiceResponseDTO response = serviceEntityService.create(request);

        assertEquals(3L, response.id());
        assertEquals("Banho e tosa", response.name());
        assertEquals(new BigDecimal("89.90"), response.price());
    }
}
