package com.example.imperiodogapi;

import com.example.imperiodogapi.service.C6BankService;
import com.example.imperiodogapi.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import tools.jackson.databind.ObjectMapper;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test")
class FrontendContractTest {
 @Autowired MockMvc mvc;
 @Autowired ObjectMapper mapper;
 @Autowired ChargeRepository charges;
 @MockitoBean C6BankService bank;
 @Test void signupLoginPetIsolationAndAdminChargeFlow() throws Exception {
  String body="""
   {"name":"Tutor Teste","email":"frontend@example.com","password":"SenhaTeste12345!",
   "phone":"11999999999","cpf":"52998224725","zipCode":"01001000","streetName":"Rua A",
   "streetNumber":"10","neighborhood":"Centro","city":"Sao Paulo","federalUnit":"SP","role":"ADMIN"}
   """;
  var registered=mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated()).andReturn();
  long customerId=mapper.readTree(registered.getResponse().getContentAsString()).path("id").asLong();
  var login=mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"frontend@example.com\",\"password\":\"SenhaTeste12345!\"}"))
    .andExpect(status().isOk()).andExpect(jsonPath("$.role").value("ROLE_CLIENT")).andReturn();
  String token=mapper.readTree(login.getResponse().getContentAsString()).path("token").asText();
  mvc.perform(get("/api/account/me").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Tutor Teste"));
  mvc.perform(get("/api/admin/customers").header("Authorization","Bearer "+token)).andExpect(status().isForbidden());
  var pet=mvc.perform(post("/api/account/pets").header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON)
    .content("{\"name\":\"Rex\",\"species\":\"Cachorro\",\"breed\":\"SRD\",\"customerId\":999999,\"sex\":\"Macho\",\"weight\":8.5,\"birthDate\":\"2020-01-01\",\"notes\":\"Alergia\"}"))
    .andExpect(status().isOk()).andExpect(jsonPath("$.customerId").value(customerId)).andReturn();
  long petId=mapper.readTree(pet.getResponse().getContentAsString()).path("id").asLong();
  mvc.perform(get("/api/account/pets").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$[0].notes").value("Alergia"));
  var service=mvc.perform(post("/api/admin/services").with(user("admin").roles("ADMIN")).contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Banho\",\"price\":25.50}"))
    .andExpect(status().isCreated()).andReturn();
  long serviceId=mapper.readTree(service.getResponse().getContentAsString()).path("id").asLong();
  var secondService=mvc.perform(post("/api/admin/services").with(user("admin").roles("ADMIN")).contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Tosa\",\"price\":40}"))
    .andExpect(status().isCreated()).andReturn();
  long secondId=mapper.readTree(secondService.getResponse().getContentAsString()).path("id").asLong();
  var today=java.time.LocalDate.now(java.time.ZoneId.of("America/Sao_Paulo"));
  String chargeBody="{\"customerId\":"+customerId+",\"petId\":"+petId+",\"items\":[{\"serviceId\":"+serviceId+",\"quantity\":3},{\"serviceId\":"+secondId+",\"quantity\":2}],\"serviceDate\":\""+today+"\",\"dueDate\":\""+today.plusDays(7)+"\"}";
  when(bank.createBoleto(any())).thenReturn(new C6BankService.Boleto("front-bank-1","CREATED","123","456",null));
  var charge=mvc.perform(post("/api/admin/charges").with(user("admin").roles("ADMIN")).header("Idempotency-Key","frontend-contract-0001").contentType(MediaType.APPLICATION_JSON).content(chargeBody))
    .andExpect(status().isCreated()).andExpect(jsonPath("$.amount").value(156.5)).andExpect(jsonPath("$.items[0].quantity").value(3)).andExpect(jsonPath("$.items[1].quantity").value(2)).andReturn();
  long chargeId=mapper.readTree(charge.getResponse().getContentAsString()).path("id").asLong();
  mvc.perform(post("/api/admin/charges").with(user("admin").roles("ADMIN")).header("Idempotency-Key","frontend-contract-0001").contentType(MediaType.APPLICATION_JSON).content(chargeBody)).andExpect(status().isCreated());
  verify(bank,times(1)).createBoleto(any());
  mvc.perform(get("/api/charges/"+chargeId).header("Authorization","Bearer "+token)).andExpect(status().isOk());
  mvc.perform(get("/api/charges/"+chargeId).with(user("another@example.com").roles("CLIENT"))).andExpect(status().isForbidden());
  mvc.perform(options("/api/admin/charges").header("Origin","http://localhost:8081").header("Access-Control-Request-Method","POST").header("Access-Control-Request-Headers","authorization,content-type,idempotency-key"))
    .andExpect(status().isOk());
 }
}
