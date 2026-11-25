package com.example.imperiodogapi;

import com.example.imperiodogapi.service.C6BankService;
import com.example.imperiodogapi.entities.Customer;
import com.example.imperiodogapi.entities.Pet;
import com.example.imperiodogapi.entities.User;
import com.example.imperiodogapi.entities.enums.Role;
import com.example.imperiodogapi.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.ObjectMapper;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Map;
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
 @Autowired UserRepository users;
 @Autowired CustomerRepository customers;
 @Autowired PetRepository pets;
 @Autowired PasswordEncoder passwordEncoder;
 @MockitoBean C6BankService bank;

 @Test
 void loginChecksBothSelectedProfilesAndPhotosArePrivate() throws Exception {
  String password = "SenhaTeste12345!";
  var owner = customers.save(Customer.builder()
    .user(testUser("photo-tutor@example.com", password, Role.CLIENT)).build());
  User tutor = owner.getUser();
  User admin = users.save(testUser("photo-admin@example.com", password, Role.ADMIN));
  User anotherTutor = users.save(testUser("photo-other@example.com", password, Role.CLIENT));
  String tutorToken = loginWithSelectedRole(tutor, password);
  String adminToken = loginWithSelectedRole(admin, password);
  String otherToken = loginWithSelectedRole(anotherTutor, password);

  var pet = pets.save(Pet.builder().name("Luna").customer(owner).build());
  String accountPhoto = "/api/account/me/photo";
  String petPhoto = "/api/account/pets/" + pet.getId() + "/photo";
  String first = photoPayload(0xB60019);
  String second = photoPayload(0x00863D);
  mvc.perform(get(accountPhoto)).andExpect(status().isUnauthorized());
  mvc.perform(get(accountPhoto).header("Authorization", tutorToken))
    .andExpect(status().isOk()).andExpect(jsonPath("$.data").isEmpty());
  String savedTutorPhoto = uploadPhoto(accountPhoto, tutorToken, first);
  String savedAdminPhoto = uploadPhoto(accountPhoto, adminToken, second);
  assertNotEquals(savedTutorPhoto, savedAdminPhoto);
  mvc.perform(get(accountPhoto).header("Authorization", tutorToken))
    .andExpect(status().isOk()).andExpect(jsonPath("$.data").value(savedTutorPhoto));
  mvc.perform(get(accountPhoto).header("Authorization", adminToken))
    .andExpect(status().isOk()).andExpect(jsonPath("$.data").value(savedAdminPhoto));

  assertEquals(savedTutorPhoto, uploadPhoto(petPhoto, tutorToken, first));
  assertEquals(savedAdminPhoto, uploadPhoto(petPhoto, adminToken, second));
  mvc.perform(get(petPhoto).header("Authorization", tutorToken))
    .andExpect(status().isOk()).andExpect(jsonPath("$.data").value(savedAdminPhoto));
  mvc.perform(get(petPhoto).header("Authorization", otherToken)).andExpect(status().isNotFound());
  mvc.perform(put(petPhoto).header("Authorization", otherToken).contentType(MediaType.APPLICATION_JSON).content(first))
    .andExpect(status().isNotFound());
  mvc.perform(put(petPhoto).header("Authorization", tutorToken).contentType(MediaType.APPLICATION_JSON)
    .content("{\"base64\":\"bm90IGFuIGltYWdl\"}")).andExpect(status().isBadRequest());
  mvc.perform(get(petPhoto).header("Authorization", tutorToken))
    .andExpect(status().isOk()).andExpect(jsonPath("$.data").value(savedAdminPhoto));
 }

 private User testUser(String email, String password, Role role) {
  return User.builder().name("Perfil de teste").email(email)
    .password(passwordEncoder.encode(password)).role(role).build();
 }

 private String loginWithSelectedRole(User account, String password) throws Exception {
  Role actual = account.getRole();
  Role other = actual == Role.ADMIN ? Role.CLIENT : Role.ADMIN;
  String otherLabel = other == Role.ADMIN ? "Equipe & Gestão" : "Tutor & Família";
  String denied = mapper.writeValueAsString(Map.of(
    "email", account.getEmail(), "password", password, "selectedRole", other));
  mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(denied))
    .andExpect(status().isForbidden()).andExpect(jsonPath("$.token").doesNotExist())
    .andExpect(jsonPath("$.error").value("Esse e-mail não está autorizado a entrar como " + otherLabel + "."));
  String allowed = mapper.writeValueAsString(Map.of(
    "email", account.getEmail(), "password", password, "selectedRole", actual));
  var response = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(allowed))
    .andExpect(status().isOk()).andExpect(jsonPath("$.role").value("ROLE_" + actual)).andReturn();
  return "Bearer " + mapper.readTree(response.getResponse().getContentAsString()).path("token").asText();
 }

 private String uploadPhoto(String path, String token, String payload) throws Exception {
  var response = mvc.perform(put(path).header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
    .content(payload)).andExpect(status().isOk()).andReturn();
  String photo = mapper.readTree(response.getResponse().getContentAsString()).path("data").asText();
  assertTrue(photo.startsWith("data:image/jpeg;base64,"));
  return photo;
 }

 private String photoPayload(int color) throws Exception {
  var image = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
  image.setRGB(0, 0, color);
  var bytes = new ByteArrayOutputStream();
  ImageIO.write(image, "PNG", bytes);
  return mapper.writeValueAsString(Map.of("base64", Base64.getEncoder().encodeToString(bytes.toByteArray())));
 }

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
  String secondBody = body
    .replace("frontend@example.com", "second@example.com")
    .replace("52998224725", "11144477735");

mvc.perform(post("/api/auth/register")
    .contentType(MediaType.APPLICATION_JSON)
    .content(secondBody))
    .andExpect(status().isCreated());

mvc.perform(put("/api/account/pets/"+petId)
    .with(user("second@example.com").roles("CLIENT"))
    .contentType(MediaType.APPLICATION_JSON)
    .content("{\"name\":\"Alteracao indevida\"}"))
    .andExpect(status().isNotFound());

mvc.perform(delete("/api/account/pets/"+petId)
    .with(user("second@example.com").roles("CLIENT")))
    .andExpect(status().isNotFound());
  mvc.perform(get("/api/account/pets").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$[0].notes").value("Alergia"));
  var service=mvc.perform(post("/api/admin/services").with(user("admin").roles("ADMIN")).contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Banho\",\"price\":25.50}"))
    .andExpect(status().isCreated()).andReturn();
  long serviceId=mapper.readTree(service.getResponse().getContentAsString()).path("id").asLong();
  var secondService=mvc.perform(post("/api/admin/services").with(user("admin").roles("ADMIN")).contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Tosa\",\"price\":40}"))
    .andExpect(status().isCreated()).andReturn();
  long secondId=mapper.readTree(secondService.getResponse().getContentAsString()).path("id").asLong();
  var today=java.time.LocalDate.now(java.time.ZoneId.of("America/Sao_Paulo"));
  String chargeBody="{\"customerId\":"+customerId+",\"petId\":"+petId+",\"items\":[{\"serviceId\":"+serviceId+",\"quantity\":3},{\"serviceId\":"+secondId+",\"quantity\":2}],\"serviceDate\":\""+today+"\",\"dueDate\":\""+today.plusDays(7)+"\"}";
  String simulatePath = "/api/admin/charges/simulate";
  String simulationKey = "frontend-simulation-0001";
  mvc.perform(post(simulatePath).header("Authorization", "Bearer " + token)
      .header("Idempotency-Key", simulationKey).contentType(MediaType.APPLICATION_JSON).content(chargeBody))
      .andExpect(status().isForbidden());
  var simulated = mvc.perform(post(simulatePath).with(user("admin").roles("ADMIN"))
      .header("Idempotency-Key", simulationKey).contentType(MediaType.APPLICATION_JSON).content(chargeBody))
      .andExpect(status().isCreated()).andExpect(jsonPath("$.issuanceState").value("SIMULATED"))
      .andExpect(jsonPath("$.amount").value(156.5)).andExpect(jsonPath("$.ticketUrl").doesNotExist()).andReturn();
  long simulatedId = mapper.readTree(simulated.getResponse().getContentAsString()).path("id").asLong();
  mvc.perform(post(simulatePath).with(user("admin").roles("ADMIN"))
      .header("Idempotency-Key", simulationKey).contentType(MediaType.APPLICATION_JSON).content(chargeBody))
      .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(simulatedId));
  mvc.perform(post("/api/admin/charges").with(user("admin").roles("ADMIN"))
      .header("Idempotency-Key", simulationKey).contentType(MediaType.APPLICATION_JSON).content(chargeBody))
      .andExpect(status().isConflict());
  mvc.perform(get("/api/charges/my-charges").header("Authorization", "Bearer " + token))
      .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(simulatedId));
  mvc.perform(get("/api/charges/my-charges").with(user("second@example.com").roles("CLIENT")))
      .andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
  mvc.perform(get("/api/charges/" + simulatedId + "/boleto").header("Authorization", "Bearer " + token))
      .andExpect(status().isNotFound());
  mvc.perform(post("/api/admin/charges/" + simulatedId + "/reconcile")
      .with(user("admin").roles("ADMIN")).param("bankSlipId", "simulated"))
      .andExpect(status().isConflict());
  verifyNoInteractions(bank);

  when(bank.createBoleto(any())).thenReturn(new C6BankService.Boleto("front-bank-1","CREATED","123","456",null));
  var charge=mvc.perform(post("/api/admin/charges").with(user("admin").roles("ADMIN")).header("Idempotency-Key","frontend-contract-0001").contentType(MediaType.APPLICATION_JSON).content(chargeBody))
    .andExpect(status().isCreated()).andExpect(jsonPath("$.amount").value(156.5)).andExpect(jsonPath("$.items[0].quantity").value(3)).andExpect(jsonPath("$.items[1].quantity").value(2)).andReturn();
  long chargeId=mapper.readTree(charge.getResponse().getContentAsString()).path("id").asLong();
  mvc.perform(delete("/api/account/pets/"+petId)
    .header("Authorization","Bearer "+token))
    .andExpect(status().isConflict());

mvc.perform(delete("/api/account/pets/"+petId)
    .with(user("admin").roles("ADMIN")))
    .andExpect(status().isForbidden());

mvc.perform(get("/api/charges/"+chargeId)
    .header("Authorization","Bearer "+token))
    .andExpect(status().isOk());

mvc.perform(put("/api/account/pets/"+petId)
    .header("Authorization","Bearer "+token)
    .contentType(MediaType.APPLICATION_JSON)
    .content("{\"name\":\"Rex Atualizado\",\"customerId\":999999}"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.name").value("Rex Atualizado"))
    .andExpect(jsonPath("$.customerId").value(customerId));
  mvc.perform(post("/api/admin/charges").with(user("admin").roles("ADMIN")).header("Idempotency-Key","frontend-contract-0001").contentType(MediaType.APPLICATION_JSON).content(chargeBody)).andExpect(status().isCreated());
  verify(bank,times(1)).createBoleto(any());
  mvc.perform(get("/api/charges/"+chargeId).header("Authorization","Bearer "+token)).andExpect(status().isOk());
  mvc.perform(get("/api/charges/"+chargeId).with(user("another@example.com").roles("CLIENT"))).andExpect(status().isForbidden());
  mvc.perform(options("/api/admin/charges").header("Origin","http://localhost:8081").header("Access-Control-Request-Method","POST").header("Access-Control-Request-Headers","authorization,content-type,idempotency-key"))
    .andExpect(status().isOk());
 }
}
