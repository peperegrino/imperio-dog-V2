package com.example.imperiodogapi.service;

import com.example.imperiodogapi.entities.Pet;
import com.example.imperiodogapi.entities.ProfilePhoto;
import com.example.imperiodogapi.entities.User;
import com.example.imperiodogapi.entities.enums.Role;
import com.example.imperiodogapi.repository.PetRepository;
import com.example.imperiodogapi.repository.ProfilePhotoRepository;
import com.example.imperiodogapi.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import javax.imageio.stream.MemoryCacheImageInputStream;
import java.awt.Color;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Service
public class ProfilePhotoService {
    private static final int MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
    public static final int MAX_BASE64_LENGTH = 4 * ((MAX_UPLOAD_BYTES + 2) / 3);
    private static final int AVATAR_SIZE = 512;
    private static final int MAX_SOURCE_EDGE = 16_384;

    private final UserRepository users;
    private final PetRepository pets;
    private final ProfilePhotoRepository photos;

    public ProfilePhotoService(UserRepository users, PetRepository pets, ProfilePhotoRepository photos) {
        this.users = users;
        this.pets = pets;
        this.photos = photos;
    }

    @Transactional(readOnly = true)
    public String accountPhoto(String email) {
        return photos.findByUser_Id(account(email).getId()).map(ProfilePhotoService::dataUri).orElse(null);
    }

    @Transactional
    public String updateAccountPhoto(String email, String encoded) {
        User user = users.findLockedByEmail(email).orElseThrow(ProfilePhotoService::accountNotFound);
        ProfilePhoto photo = photos.findByUser_Id(user.getId()).orElseGet(() -> new ProfilePhoto(user));
        return save(photo, encoded);
    }

    @Transactional(readOnly = true)
    public String petPhoto(String email, Long petId) {
        Pet pet = pets.findById(petId).orElseThrow(ProfilePhotoService::petNotFound);
        verifyPetAccess(account(email), pet);
        return photos.findByPet_Id(petId).map(ProfilePhotoService::dataUri).orElse(null);
    }

    @Transactional
    public String updatePetPhoto(String email, Long petId, String encoded) {
        Pet pet = pets.findLockedById(petId).orElseThrow(ProfilePhotoService::petNotFound);
        verifyPetAccess(account(email), pet);
        ProfilePhoto photo = photos.findByPet_Id(petId).orElseGet(() -> new ProfilePhoto(pet));
        return save(photo, encoded);
    }

    @Transactional
    public void deleteAccountPhoto(String email) {
        User user = users.findLockedByEmail(email).orElseThrow(ProfilePhotoService::accountNotFound);
        photos.findByUser_Id(user.getId()).ifPresent(photos::delete);
    }

    @Transactional
    public void deletePetPhoto(String email, Long petId) {
        Pet pet = pets.findLockedById(petId).orElseThrow(ProfilePhotoService::petNotFound);
        verifyPetAccess(account(email), pet);
        photos.findByPet_Id(petId).ifPresent(photos::delete);
    }

    private String save(ProfilePhoto photo, String encoded) {
        photo.setJpeg(normalize(encoded));
        return dataUri(photos.save(photo));
    }

    private User account(String email) {
        return users.findByEmail(email).orElseThrow(ProfilePhotoService::accountNotFound);
    }

    private static void verifyPetAccess(User user, Pet pet) {
        if (user.getRole() != Role.ADMIN && !pet.getCustomer().getUser().getId().equals(user.getId())) {
            throw petNotFound();
        }
    }

    private static ResponseStatusException accountNotFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada.");
    }

    private static ResponseStatusException petNotFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet não encontrado.");
    }

    private static String dataUri(ProfilePhoto photo) {
        return "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(photo.getJpeg());
    }

    private static byte[] normalize(String encoded) {
        try {
            byte[] bytes = Base64.getDecoder().decode(encoded);
            if (bytes.length > MAX_UPLOAD_BYTES) {
                throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "A foto deve ter até 4 MB.");
            }
            try (var input = new MemoryCacheImageInputStream(new ByteArrayInputStream(bytes))) {
                var readers = ImageIO.getImageReaders(input);
                if (!readers.hasNext()) throw invalidPhoto();
                var reader = readers.next();
                try {
                    String format = reader.getFormatName();
                    if (!format.equalsIgnoreCase("JPEG") && !format.equalsIgnoreCase("PNG")) throw invalidPhoto();
                    reader.setInput(input, true, true);
                    int edge = Math.max(reader.getWidth(0), reader.getHeight(0));
                    if (edge > MAX_SOURCE_EDGE) throw invalidPhoto();
                    int step = Math.max(1, edge / (AVATAR_SIZE * 2));
                    var params = reader.getDefaultReadParam();
                    params.setSourceSubsampling(step, step, 0, 0);
                    return resize(reader.read(0, params));
                } finally {
                    reader.dispose();
                }
            }
        } catch (IOException | IllegalArgumentException exception) {
            throw invalidPhoto();
        }
    }

    private static byte[] resize(BufferedImage original) throws IOException {
        double scale = Math.min(1.0, (double) AVATAR_SIZE / Math.max(original.getWidth(), original.getHeight()));
        int width = Math.max(1, (int) Math.round(original.getWidth() * scale));
        int height = Math.max(1, (int) Math.round(original.getHeight() * scale));
        var jpeg = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        var graphics = jpeg.createGraphics();
        try {
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, width, height);
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            graphics.drawImage(original, 0, 0, width, height, null);
        } finally {
            graphics.dispose();
        }
        var output = new ByteArrayOutputStream();
        ImageIO.write(jpeg, "JPEG", output);
        return output.toByteArray();
    }

    private static ResponseStatusException invalidPhoto() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione uma imagem JPG ou PNG válida.");
    }
}
