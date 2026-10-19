package com.inzynierka.backend.controller;

import com.inzynierka.backend.model.Advertisement;
import com.inzynierka.backend.repository.AdvertisementRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/advertisements")
@CrossOrigin(origins = "http://localhost:5173")
public class AdvertisementController {

    private final AdvertisementRepository advertisementRepository;

    public AdvertisementController(AdvertisementRepository advertisementRepository) {
        this.advertisementRepository = advertisementRepository;
    }

    @GetMapping
    public List<Advertisement> getAllAds(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return advertisementRepository.findByCategory(category);
        }
        return advertisementRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Advertisement> getAdById(@PathVariable Long id) {
        return advertisementRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Advertisement createAd(@RequestBody Advertisement advertisement) {
        return advertisementRepository.save(advertisement);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAd(@PathVariable Long id) {
        if (advertisementRepository.existsById(id)) {
            advertisementRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}