package com.inzynierka.backend.controller;

import com.inzynierka.backend.model.Advertisement;
import com.inzynierka.backend.model.User;
import com.inzynierka.backend.repository.AdvertisementRepository;
import com.inzynierka.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepository;
    private final AdvertisementRepository advertisementRepository;

    // Statystyki serwisu
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        long totalUsers = userRepository.count();
        long totalAds = advertisementRepository.count();

        List<Advertisement> allAds = advertisementRepository.findAll();
        BigDecimal totalValue = allAds.stream()
                .map(Advertisement::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalAds", totalAds);
        stats.put("totalValue", totalValue);

        return ResponseEntity.ok(stats);
    }

    // Lista wszystkich zarejestrowanych użytkowników
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // Usunięcie użytkownika przez admina
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}