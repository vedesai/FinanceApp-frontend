package com.financeapp.controller;

import com.financeapp.entity.Liability;
import com.financeapp.service.LiabilityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/liabilities")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class LiabilityController {
    @Autowired
    private LiabilityService liabilityService;

    @GetMapping
    public ResponseEntity<List<Liability>> getAllLiabilities() {
        List<Liability> liabilities = liabilityService.getAllLiabilities();
        return ResponseEntity.ok(liabilities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Liability> getLiabilityById(@PathVariable Long id) {
        return liabilityService.getLiabilityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Liability> createLiability(@Valid @RequestBody Liability liability) {
        Liability createdLiability = liabilityService.createLiability(liability);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLiability);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Liability> updateLiability(@PathVariable Long id, @Valid @RequestBody Liability liability) {
        try {
            Liability updatedLiability = liabilityService.updateLiability(id, liability);
            return ResponseEntity.ok(updatedLiability);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLiability(@PathVariable Long id) {
        try {
            liabilityService.deleteLiability(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportLiabilities() {
        List<Liability> liabilities = liabilityService.getAllLiabilities();
        StringBuilder csv = new StringBuilder();
        
        // CSV Header
        csv.append("ID,Name,Liability Type,Amount,Description,Created At,Updated At\n");
        
        // CSV Data
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (Liability liability : liabilities) {
            csv.append(liability.getId()).append(",");
            csv.append(escapeCsv(liability.getName())).append(",");
            csv.append(escapeCsv(liability.getLiabilityType())).append(",");
            csv.append(liability.getAmount()).append(",");
            csv.append(escapeCsv(liability.getDescription() != null ? liability.getDescription() : "")).append(",");
            csv.append(liability.getCreatedAt() != null ? liability.getCreatedAt().format(formatter) : "").append(",");
            csv.append(liability.getUpdatedAt() != null ? liability.getUpdatedAt().format(formatter) : "").append("\n");
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "liabilities_export.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csv.toString());
    }
    
    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}

