package com.financeapp.service;

import com.financeapp.entity.Asset;
import com.financeapp.entity.Investment;
import com.financeapp.entity.Liability;
import com.financeapp.repository.AssetRepository;
import com.financeapp.repository.InvestmentRepository;
import com.financeapp.repository.LiabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {
    @Autowired
    private AssetRepository assetRepository;
    
    @Autowired
    private InvestmentRepository investmentRepository;
    
    @Autowired
    private LiabilityRepository liabilityRepository;

    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        // Calculate total assets
        BigDecimal totalAssets = assetRepository.findAll().stream()
                .map(Asset::getValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate total investments (using current amount)
        BigDecimal totalInvestments = investmentRepository.findAll().stream()
                .map(Investment::getCurrentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Total assets including investments
        BigDecimal totalAssetsWithInvestments = totalAssets.add(totalInvestments);
        
        // Calculate total liabilities
        BigDecimal totalLiabilities = liabilityRepository.findAll().stream()
                .map(Liability::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate net worth (turnover)
        BigDecimal netWorth = totalAssetsWithInvestments.subtract(totalLiabilities);
        
        summary.put("totalAssets", totalAssets.doubleValue());
        summary.put("totalInvestments", totalInvestments.doubleValue());
        summary.put("totalAssetsWithInvestments", totalAssetsWithInvestments.doubleValue());
        summary.put("totalLiabilities", totalLiabilities.doubleValue());
        summary.put("netWorth", netWorth.doubleValue());
        summary.put("assetCount", assetRepository.count());
        summary.put("investmentCount", investmentRepository.count());
        summary.put("liabilityCount", liabilityRepository.count());
        
        return summary;
    }
}

