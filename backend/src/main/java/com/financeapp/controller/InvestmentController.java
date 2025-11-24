package com.financeapp.controller;

import com.financeapp.entity.Investment;
import com.financeapp.service.InvestmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/investments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class InvestmentController {
    @Autowired
    private InvestmentService investmentService;

    @GetMapping
    public ResponseEntity<List<Investment>> getAllInvestments() {
        List<Investment> investments = investmentService.getAllInvestments();
        return ResponseEntity.ok(investments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Investment> getInvestmentById(@PathVariable Long id) {
        return investmentService.getInvestmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Investment> createInvestment(@Valid @RequestBody Investment investment) {
        Investment createdInvestment = investmentService.createInvestment(investment);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdInvestment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Investment> updateInvestment(@PathVariable Long id, @Valid @RequestBody Investment investment) {
        try {
            Investment updatedInvestment = investmentService.updateInvestment(id, investment);
            return ResponseEntity.ok(updatedInvestment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvestment(@PathVariable Long id) {
        try {
            investmentService.deleteInvestment(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportInvestments() {
        List<Investment> investments = investmentService.getAllInvestments();
        StringBuilder csv = new StringBuilder();
        
        // CSV Header
        csv.append("ID,Investment Type,Provider/Broker,Investment Amount,Current Amount,Gain/Loss,Gain/Loss %,Purchased Date,Maturity Date,Scheme Code,Scheme Name,External ID,Created At,Updated At\n");
        
        // CSV Data
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (Investment investment : investments) {
            BigDecimal investmentAmount = investment.getInvestmentAmount();
            BigDecimal currentAmount = investment.getCurrentAmount();
            BigDecimal gainLoss = currentAmount.subtract(investmentAmount);
            BigDecimal gainLossPercent = investmentAmount.compareTo(BigDecimal.ZERO) > 0 
                ? gainLoss.divide(investmentAmount, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;
            
            csv.append(investment.getId()).append(",");
            csv.append(escapeCsv(investment.getInvestmentType())).append(",");
            csv.append(escapeCsv(investment.getProviderBroker())).append(",");
            csv.append(investmentAmount).append(",");
            csv.append(currentAmount).append(",");
            csv.append(gainLoss).append(",");
            csv.append(gainLossPercent.setScale(2, java.math.RoundingMode.HALF_UP)).append(",");
            csv.append(investment.getPurchasedDate() != null ? investment.getPurchasedDate().toString() : "").append(",");
            csv.append(investment.getMaturityDate() != null ? investment.getMaturityDate().toString() : "").append(",");
            csv.append(escapeCsv(investment.getSchemeCode() != null ? investment.getSchemeCode() : "")).append(",");
            csv.append(escapeCsv(investment.getSchemeName() != null ? investment.getSchemeName() : "")).append(",");
            csv.append(escapeCsv(investment.getExternalId() != null ? investment.getExternalId() : "")).append(",");
            csv.append(investment.getCreatedAt() != null ? investment.getCreatedAt().format(formatter) : "").append(",");
            csv.append(investment.getUpdatedAt() != null ? investment.getUpdatedAt().format(formatter) : "").append("\n");
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "investments_export.csv");
        
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

