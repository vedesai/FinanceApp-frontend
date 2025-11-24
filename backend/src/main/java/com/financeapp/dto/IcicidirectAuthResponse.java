package com.financeapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class IcicidirectAuthResponse {
    @JsonProperty("SessionToken")
    private String sessionToken;

    @JsonProperty("Status")
    private String status;

    @JsonProperty("Message")
    private String message;

    public String getSessionToken() {
        return sessionToken;
    }

    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

