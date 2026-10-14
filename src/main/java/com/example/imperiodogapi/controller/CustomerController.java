package com.example.imperiodogapi.controller;

import com.example.imperiodogapi.dto.CustomerResponseDTO;
import com.example.imperiodogapi.service.CustomerService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/customers", "/api/customers"})
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/me")
    public CustomerResponseDTO getProfile(@AuthenticationPrincipal UserDetails principal) {
        return customerService.findByEmail(principal.getUsername());
    }
}
