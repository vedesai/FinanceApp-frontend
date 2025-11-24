package com.financeapp.service;

import com.financeapp.dto.IcicidirectMfSip;
import com.financeapp.dto.IcicidirectMfSipResponse;
import com.financeapp.entity.Investment;
import com.financeapp.repository.InvestmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@Transactional
public class IcicidirectSyncService {
    private static final Logger logger = LoggerFactory.getLogger(IcicidirectSyncService.class);
    
    @Autowired
    private IcicidirectApiService apiService;
    
    @Autowired
    private InvestmentRepository investmentRepository;

    public int syncMutualFundInvestments() {
        try {
            logger.info("Starting ICICIDirect mutual fund sync...");
            
            // Fetch active SIPs
            IcicidirectMfSipResponse response = apiService.getMutualFundSips("A");
            
            if (response == null || response.getData() == null || response.getData().isEmpty()) {
                logger.warn("No mutual fund SIPs found");
                return 0;
            }
            
            int syncedCount = 0;
            int updatedCount = 0;
            int createdCount = 0;
            
            for (IcicidirectMfSip sip : response.getData()) {
                try {
                    // Find existing investment by external ID (SIP ID)
                    Optional<Investment> existingInvestment = investmentRepository
                        .findByExternalIdAndProviderBroker(sip.getSipId(), "ICICIDirect");
                    
                    Investment investment;
                    if (existingInvestment.isPresent()) {
                        investment = existingInvestment.get();
                        updatedCount++;
                        logger.debug("Updating existing investment: {}", sip.getSchemeName());
                    } else {
                        investment = new Investment();
                        createdCount++;
                        logger.debug("Creating new investment: {}", sip.getSchemeName());
                    }
                    
                    // Map SIP data to Investment entity
                    investment.setInvestmentType("Mutual Fund");
                    investment.setProviderBroker("ICICIDirect");
                    investment.setExternalId(sip.getSipId());
                    investment.setSchemeCode(sip.getSchemeCode());
                    investment.setSchemeName(sip.getSchemeName());
                    
                    // Set investment amount (SIP amount)
                    if (sip.getSipAmount() != null) {
                        investment.setInvestmentAmount(sip.getSipAmount());
                    } else {
                        investment.setInvestmentAmount(BigDecimal.ZERO);
                    }
                    
                    // Set current value
                    if (sip.getCurrentValue() != null) {
                        investment.setCurrentAmount(sip.getCurrentValue());
                    } else {
                        investment.setCurrentAmount(BigDecimal.ZERO);
                    }
                    
                    investmentRepository.save(investment);
                    syncedCount++;
                    
                } catch (Exception e) {
                    logger.error("Error syncing SIP: {}", sip.getSchemeName(), e);
                }
            }
            
            logger.info("ICICIDirect sync completed. Created: {}, Updated: {}, Total: {}", 
                createdCount, updatedCount, syncedCount);
            
            return syncedCount;
            
        } catch (Exception e) {
            logger.error("Error during ICICIDirect sync", e);
            throw new RuntimeException("Failed to sync mutual fund investments", e);
        }
    }
}

