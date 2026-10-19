package com.inzynierka.backend.controller;

import com.inzynierka.backend.model.Advertisement;
import com.inzynierka.backend.model.Role;
import com.inzynierka.backend.model.User;
import com.inzynierka.backend.repository.AdvertisementRepository;
import com.inzynierka.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/advertisements")
@CrossOrigin(origins = "http://localhost:5173")
public class AdvertisementController {

    private final AdvertisementRepository advertisementRepository;
    private final UserRepository userRepository;

    public AdvertisementController(AdvertisementRepository advertisementRepository, UserRepository userRepository) {
        this.advertisementRepository = advertisementRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public Page<Advertisement> getAllAds(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean onlyMine,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication
    ) {
        Specification<Advertisement> spec = (root, query, cb) -> cb.conjunction();

        // Filtr: tylko ogłoszenia zalogowanego użytkownika
        if (Boolean.TRUE.equals(onlyMine)) {
            if (authentication == null || !authentication.isAuthenticated()) {
                return Page.empty();
            }
            String userEmail = authentication.getName();
            spec = spec.and((root, query, cb) -> cb.equal(root.get("user").get("email"), userEmail));
        }

        if (category != null && !category.trim().isEmpty() && !category.equals("Wszystkie")) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), category.trim()));
        }

        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }

        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }

        if (search != null && !search.trim().isEmpty()) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            ));
        }

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return advertisementRepository.findAll(spec, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Advertisement> getAdById(@PathVariable Long id) {
        return advertisementRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Advertisement> createAd(@RequestBody Advertisement advertisement, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zalogowanego użytkownika"));

        advertisement.setUser(currentUser);
        Advertisement saved = advertisementRepository.save(advertisement);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Advertisement> updateAd(
            @PathVariable Long id,
            @RequestBody Advertisement updatedAd,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = authentication.getName();

        return advertisementRepository.findById(id)
                .map(existingAd -> {
                    boolean isOwner = existingAd.getUser() != null && existingAd.getUser().getEmail().equals(userEmail);
                    boolean isAdmin = authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals(Role.ROLE_ADMIN.name()));

                    if (!isOwner && !isAdmin) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Advertisement>build();
                    }

                    existingAd.setTitle(updatedAd.getTitle());
                    existingAd.setDescription(updatedAd.getDescription());
                    existingAd.setPrice(updatedAd.getPrice());
                    existingAd.setCategory(updatedAd.getCategory());
                    existingAd.setLocation(updatedAd.getLocation());
                    existingAd.setContactPhone(updatedAd.getContactPhone());
                    existingAd.setImageUrl(updatedAd.getImageUrl());

                    return ResponseEntity.ok(advertisementRepository.save(existingAd));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAd(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = authentication.getName();

        return advertisementRepository.findById(id)
                .map(existingAd -> {
                    boolean isOwner = existingAd.getUser() != null && existingAd.getUser().getEmail().equals(userEmail);
                    boolean isAdmin = authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals(Role.ROLE_ADMIN.name()));

                    if (!isOwner && !isAdmin) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                    }

                    advertisementRepository.delete(existingAd);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}