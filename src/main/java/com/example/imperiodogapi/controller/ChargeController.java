package com.example.imperiodogapi.controller;

import com.example.imperiodogapi.dto.ChargeResponseDTO;
import com.example.imperiodogapi.service.ChargeService;
import com.example.imperiodogapi.service.C6BankService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/charges", "/api/charges"})
public class ChargeController {

    private final ChargeService chargeService;
    private final C6BankService c6BankService;

    public ChargeController(ChargeService chargeService, C6BankService c6BankService) {
        this.chargeService = chargeService;
        this.c6BankService = c6BankService;
    }

    @GetMapping("/my-charges")
    public List<ChargeResponseDTO> myCharges(@AuthenticationPrincipal UserDetails principal) {
        return chargeService.findMyCharges(principal.getUsername());
    }

    @GetMapping("/{id}")
    public ChargeResponseDTO getCharge(@PathVariable Long id,
                                       @AuthenticationPrincipal UserDetails principal) {
        boolean admin = AuthorityUtils.authorityListToSet(principal.getAuthorities()).contains("ROLE_ADMIN");
        return chargeService.findByIdForUser(id, principal.getUsername(), admin);
    }

    @GetMapping("/{id}/boleto")
    public ResponseEntity<byte[]> downloadBoleto(@PathVariable Long id,
                                                  @AuthenticationPrincipal UserDetails principal) {
        boolean admin = AuthorityUtils.authorityListToSet(principal.getAuthorities()).contains("ROLE_ADMIN");
        String bankSlipId = chargeService.findBankSlipIdForUser(id, principal.getUsername(), admin);
        byte[] pdf = c6BankService.downloadBoleto(bankSlipId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=boleto-" + id + ".pdf")
                .body(pdf);
    }
}
