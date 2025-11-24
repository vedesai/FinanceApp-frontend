package com.financeapp.controller;

import com.financeapp.service.IcicidirectSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/icicidirect")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class IcicidirectSyncController {
    @Autowired
    private IcicidirectSyncService syncService;

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncMutualFunds() {
        Map<String, Object> response = new HashMap<>();
        try {
            int syncedCount = syncService.syncMutualFundInvestments();
            response.put("success", true);
            response.put("message", "Successfully synced mutual fund investments");
            response.put("syncedCount", syncedCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to sync: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}

