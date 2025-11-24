package com.financeapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class IcicidirectMfSipResponse {
    @JsonProperty("Status")
    private String status;

    @JsonProperty("Message")
    private String message;

    @JsonProperty("Data")
    private List<IcicidirectMfSip> data;

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

    public List<IcicidirectMfSip> getData() {
        return data;
    }

    public void setData(List<IcicidirectMfSip> data) {
        this.data = data;
    }
}

