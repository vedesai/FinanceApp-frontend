package com.financeapp.service;

import com.financeapp.config.IcicidirectProperties;
import com.financeapp.dto.IcicidirectAuthRequest;
import com.financeapp.dto.IcicidirectAuthResponse;
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
public class IcicidirectAuthService {
    private static final Logger logger = LoggerFactory.getLogger(IcicidirectAuthService.class);
    
    @Autowired
    private IcicidirectProperties properties;
    
    @Autowired
    private WebClient.Builder webClientBuilder;
    
    private String sessionToken;
    private LocalDateTime tokenExpiry;

    public String getSessionToken() {
        if (sessionToken == null || isTokenExpired()) {
            authenticate();
        }
        return sessionToken;
    }

    private boolean isTokenExpired() {
        return tokenExpiry == null || LocalDateTime.now().isAfter(tokenExpiry.minusMinutes(5));
    }

    private void authenticate() {
        try {
            String timeStamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm:ss"));
            
            // Create JSON post data for authentication
            String jsonPostData = String.format(
                "{\"Idirect_Userid\":\"%s\",\"Password\":\"%s\"}",
                properties.getApi().getUserId(),
                properties.getApi().getPassword()
            );
            
            // Calculate checksum
            String checksum = calculateChecksum(timeStamp + jsonPostData + properties.getApi().getClientSecret());
            
            IcicidirectAuthRequest request = new IcicidirectAuthRequest();
            request.setAppKey(properties.getApi().getAppKey());
            request.setTimeStamp(timeStamp);
            request.setJsonPostData(jsonPostData);
            request.setChecksum(checksum);
            
            WebClient webClient = webClientBuilder.baseUrl(properties.getApi().getBaseUrl()).build();
            
            IcicidirectAuthResponse response = webClient.post()
                .uri("/apiuser/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(IcicidirectAuthResponse.class)
                .block();
            
            if (response != null && "Success".equalsIgnoreCase(response.getStatus())) {
                sessionToken = response.getSessionToken();
                tokenExpiry = LocalDateTime.now().plusHours(1); // Token valid for 1 hour
                logger.info("ICICIDirect authentication successful");
            } else {
                logger.error("ICICIDirect authentication failed: {}", response != null ? response.getMessage() : "Unknown error");
                throw new RuntimeException("Authentication failed: " + (response != null ? response.getMessage() : "Unknown error"));
            }
        } catch (Exception e) {
            logger.error("Error during ICICIDirect authentication", e);
            throw new RuntimeException("Failed to authenticate with ICICIDirect", e);
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

    public void invalidateToken() {
        sessionToken = null;
        tokenExpiry = null;
    }
}

