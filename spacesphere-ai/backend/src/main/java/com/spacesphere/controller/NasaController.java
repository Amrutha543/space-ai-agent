package com.spacesphere.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.spacesphere.service.NasaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/nasa")
public class NasaController {

    private final NasaService nasaService;

    public NasaController(NasaService nasaService) {
        this.nasaService = nasaService;
    }

    @GetMapping("/apod")
    public ResponseEntity<JsonNode> apod() {
        return ResponseEntity.ok(nasaService.apod());
    }

    @GetMapping("/neo")
    public ResponseEntity<JsonNode> neo() {
        return ResponseEntity.ok(nasaService.neoToday());
    }

    @GetMapping("/donki")
    public ResponseEntity<JsonNode> donki(@RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(nasaService.donki(days));
    }
}
