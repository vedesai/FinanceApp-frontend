package com.financeapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public class IcicidirectMfSip {
    @JsonProperty("scheme_name")
    private String schemeName;

    @JsonProperty("scheme_code")
    private String schemeCode;

    @JsonProperty("sip_amount")
    private BigDecimal sipAmount;

    @JsonProperty("current_value")
    private BigDecimal currentValue;

    @JsonProperty("sip_id")
    private String sipId;

    @JsonProperty("transaction_date")
    private String transactionDate;

    @JsonProperty("order_sip_status")
    private String orderSipStatus;

    public String getSchemeName() {
        return schemeName;
    }

    public void setSchemeName(String schemeName) {
        this.schemeName = schemeName;
    }

    public String getSchemeCode() {
        return schemeCode;
    }

    public void setSchemeCode(String schemeCode) {
        this.schemeCode = schemeCode;
    }

    public BigDecimal getSipAmount() {
        return sipAmount;
    }

    public void setSipAmount(BigDecimal sipAmount) {
        this.sipAmount = sipAmount;
    }

    public BigDecimal getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(BigDecimal currentValue) {
        this.currentValue = currentValue;
    }

    public String getSipId() {
        return sipId;
    }

    public void setSipId(String sipId) {
        this.sipId = sipId;
    }

    public String getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(String transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getOrderSipStatus() {
        return orderSipStatus;
    }

    public void setOrderSipStatus(String orderSipStatus) {
        this.orderSipStatus = orderSipStatus;
    }
}

