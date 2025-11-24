package com.financeapp.controller;

import com.financeapp.entity.Asset;
import com.financeapp.service.AssetService;
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
@RequestMapping("/api/assets")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AssetController {
    @Autowired
    private AssetService assetService;

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        List<Asset> assets = assetService.getAllAssets();
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable Long id) {
        return assetService.getAssetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Asset> createAsset(@Valid @RequestBody Asset asset) {
        Asset createdAsset = assetService.createAsset(asset);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAsset);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable Long id, @Valid @RequestBody Asset asset) {
        try {
            Asset updatedAsset = assetService.updateAsset(id, asset);
            return ResponseEntity.ok(updatedAsset);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        try {
            assetService.deleteAsset(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportAssets() {
        List<Asset> assets = assetService.getAllAssets();
        StringBuilder csv = new StringBuilder();
        
        // CSV Header
        csv.append("ID,Name,Asset Type,Value,Description,Created At,Updated At\n");
        
        // CSV Data
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (Asset asset : assets) {
            csv.append(asset.getId()).append(",");
            csv.append(escapeCsv(asset.getName())).append(",");
            csv.append(escapeCsv(asset.getAssetType())).append(",");
            csv.append(asset.getValue()).append(",");
            csv.append(escapeCsv(asset.getDescription() != null ? asset.getDescription() : "")).append(",");
            csv.append(asset.getCreatedAt() != null ? asset.getCreatedAt().format(formatter) : "").append(",");
            csv.append(asset.getUpdatedAt() != null ? asset.getUpdatedAt().format(formatter) : "").append("\n");
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "assets_export.csv");
        
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

