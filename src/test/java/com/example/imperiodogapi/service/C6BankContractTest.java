package com.example.imperiodogapi.service;

import com.example.imperiodogapi.entities.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class C6BankContractTest {
    C6BankService bank;
    MockRestServiceServer server;

    @BeforeEach
    void setup() {
        bank = new C6BankService("https://sandbox.invalid", "client", "secret", "unused.p12", "unused", "21");
        RestClient.Builder builder = RestClient.builder().baseUrl("https://sandbox.invalid");
        server = MockRestServiceServer.bindTo(builder).build();
        ReflectionTestUtils.setField(bank, "restClient", builder.build());
    }

    void auth() {
        server.expect(requestTo("https://sandbox.invalid/v1/auth"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(content().string("client_id=client&client_secret=secret&grant_type=client_credentials"))
                .andRespond(withSuccess("{\"access_token\":\"token\",\"expires_in\":600}", MediaType.APPLICATION_JSON));
    }

    @Test
    void serializesPayerAndStableReferenceAndReusesAuthForPdf() {
        auth();
        server.expect(requestTo("https://sandbox.invalid/v1/bank_slips"))
                .andExpect(method(HttpMethod.POST)).andExpect(header("Authorization", "Bearer token"))
                .andExpect(content().json("""
                        {"external_reference_id":"ABC1234567","amount":89.90,"due_date":"2026-12-10",
                         "billing_scheme":"21","payer":{"name":"Maria","tax_id":"12345678909",
                         "email":"maria@example.com","address":{"street":"Rua A","number":10,
                         "city":"Sao Paulo","state":"SP","zip_code":"01001000"}}}
                        """))
                .andRespond(withSuccess("{\"id\":\"bank-1\",\"status\":\"CREATED\",\"bar_code\":\"123\",\"digitable_line\":\"456\"}", MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://sandbox.invalid/v1/bank_slips/bank-1/pdf"))
                .andExpect(header("Authorization", "Bearer token"))
                .andRespond(withSuccess("%PDF-1.4 test", MediaType.APPLICATION_PDF));
        User user = User.builder().name("Maria").cpf("12345678909").email("maria@example.com")
                .streetName("Rua A").streetNumber("10").city("Sao Paulo").federalUnit("SP").zipCode("01001000").build();
        Charge charge = Charge.builder().customer(Customer.builder().user(user).build())
                .amount(new BigDecimal("89.90")).dueDate(LocalDate.of(2026,12,10)).c6ExternalReferenceId("ABC1234567").build();
        var boleto = bank.createBoleto(charge);
        assertEquals("bank-1", boleto.id());
        assertEquals("456", boleto.digitableLine());
        assertTrue(bank.downloadBoleto(boleto.id()).length > 4);
        server.verify();
    }

    @Test
    void parsesFieldsRequiredForReconciliation() {
        auth();
        server.expect(requestTo("https://sandbox.invalid/v1/bank_slips/bank-1"))
                .andRespond(withSuccess("""
                        {"id":"bank-1","status":"PAID","external_reference_id":"ABC1234567",
                         "amount":89.90,"due_date":"2026-12-10","payment_date":"2026-12-09",
                         "payer":{"tax_id":"12345678909"}}
                        """, MediaType.APPLICATION_JSON));
        var boleto = bank.getBoleto("bank-1");
        assertEquals("ABC1234567", boleto.externalReferenceId());
        assertEquals(0, new BigDecimal("89.90").compareTo(boleto.amount()));
        assertEquals(LocalDate.of(2026,12,9).atStartOfDay(), boleto.paymentDate());
        assertEquals("12345678909", boleto.payerTaxId());
        server.verify();
    }

    @Test
    void refusesDifferentBoletoAndInvalidPdf() {
        auth();
        server.expect(requestTo("https://sandbox.invalid/v1/bank_slips/bank-1"))
                .andRespond(withSuccess("{\"id\":\"other\",\"status\":\"PAID\"}", MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://sandbox.invalid/v1/bank_slips/bank-1/pdf"))
                .andRespond(withSuccess("not a pdf", MediaType.APPLICATION_PDF));
        assertThrows(ResponseStatusException.class, () -> bank.getBoleto("bank-1"));
        assertThrows(ResponseStatusException.class, () -> bank.downloadBoleto("bank-1"));
        server.verify();
    }
}
