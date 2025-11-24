package com.financeapp.scheduler;

import com.financeapp.config.IcicidirectProperties;
import com.financeapp.service.IcicidirectSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class IcicidirectSyncScheduler {
    private static final Logger logger = LoggerFactory.getLogger(IcicidirectSyncScheduler.class);
    
    @Autowired
    private IcicidirectSyncService syncService;
    
    @Autowired
    private IcicidirectProperties properties;

    @Scheduled(cron = "${icicidirect.sync.cron:0 0 2 * * ?}")
    public void syncMutualFundInvestments() {
        if (!properties.getSync().isEnabled()) {
            logger.debug("ICICIDirect sync is disabled");
            return;
        }
        
        try {
            logger.info("Starting scheduled ICICIDirect mutual fund sync...");
            int count = syncService.syncMutualFundInvestments();
            logger.info("Scheduled sync completed. Synced {} investments", count);
        } catch (Exception e) {
            logger.error("Error during scheduled sync", e);
        }
    }
}

