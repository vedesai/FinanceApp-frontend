package com.financeapp.service;

import com.financeapp.config.IcicidirectProperties;
import com.financeapp.dto.IcicidirectAuthRequest;
import com.financeapp.dto.IcicidirectMfSipResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class IcicidirectApiService {
    private static final Logger logger = LoggerFactory.getLogger(IcicidirectApiService.class);
    
    @Autowired
    private IcicidirectProperties properties;
    
    @Autowired
    private IcicidirectAuthService authService;
    
    @Autowired
    private WebClient.Builder webClientBuilder;

    public IcicidirectMfSipResponse getMutualFundSips(String sipStatus) {
        try {
            String sessionToken = authService.getSessionToken();
            String timeStamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm:ss"));
            
            // Create JSON post data
            String jsonPostData = String.format(
                "{\"SessionToken\":\"%s\",\"Idirect_Userid\":\"%s\",\"order_sip_status\":\"%s\"}",
                sessionToken,
                properties.getApi().getUserId(),
                sipStatus != null ? sipStatus : "A" // A for Active
            );
            
            // Calculate checksum
            String checksum = calculateChecksum(timeStamp + jsonPostData + properties.getApi().getClientSecret());
            
            IcicidirectAuthRequest request = new IcicidirectAuthRequest();
            request.setAppKey(properties.getApi().getAppKey());
            request.setTimeStamp(timeStamp);
            request.setJsonPostData(jsonPostData);
            request.setChecksum(checksum);
            
            WebClient webClient = webClientBuilder.baseUrl(properties.getApi().getBaseUrl()).build();
            
            IcicidirectMfSipResponse response = webClient.post()
                .uri("/mf/mfSIPBook")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(IcicidirectMfSipResponse.class)
                .block();
            
            if (response != null && "Success".equalsIgnoreCase(response.getStatus())) {
                logger.info("Successfully fetched {} SIP records from ICICIDirect", 
                    response.getData() != null ? response.getData().size() : 0);
                return response;
            } else {
                logger.error("Failed to fetch SIP data: {}", response != null ? response.getMessage() : "Unknown error");
                throw new RuntimeException("Failed to fetch SIP data: " + (response != null ? response.getMessage() : "Unknown error"));
            }
        } catch (Exception e) {
            logger.error("Error fetching mutual fund SIPs from ICICIDirect", e);
            throw new RuntimeException("Failed to fetch mutual fund SIPs", e);
        }
    }

    private String calculateChecksum(String data) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            logger.error("Error calculating checksum", e);
            throw new RuntimeException("Failed to calculate checksum", e);
        }
    }
}

