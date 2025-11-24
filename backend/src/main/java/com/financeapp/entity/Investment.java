package com.financeapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "investments")
public class Investment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Investment type is required")
    @Column(nullable = false)
    private String investmentType;

    @NotBlank(message = "Provider/Broker is required")
    @Column(nullable = false)
    private String providerBroker;

    @NotNull(message = "Investment amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Investment amount must be greater than 0")
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal investmentAmount;

    @NotNull(message = "Current amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Current amount must be greater than or equal to 0")
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal currentAmount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "external_id")
    private String externalId; // For ICICIDirect SIP ID or scheme code

    @Column(name = "scheme_code")
    private String schemeCode; // Mutual fund scheme code

    @Column(name = "scheme_name")
    private String schemeName; // Mutual fund scheme name

    @Column(name = "purchased_date")
    private LocalDate purchasedDate; // Date when investment was purchased

    @Column(name = "maturity_date")
    private LocalDate maturityDate; // Date when investment matures

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvestmentType() {
        return investmentType;
    }

    public void setInvestmentType(String investmentType) {
        this.investmentType = investmentType;
    }

    public String getProviderBroker() {
        return providerBroker;
    }

    public void setProviderBroker(String providerBroker) {
        this.providerBroker = providerBroker;
    }

    public BigDecimal getInvestmentAmount() {
        return investmentAmount;
    }

    public void setInvestmentAmount(BigDecimal investmentAmount) {
        this.investmentAmount = investmentAmount;
    }

    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }

    public void setCurrentAmount(BigDecimal currentAmount) {
        this.currentAmount = currentAmount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getSchemeCode() {
        return schemeCode;
    }

    public void setSchemeCode(String schemeCode) {
        this.schemeCode = schemeCode;
    }

    public String getSchemeName() {
        return schemeName;
    }

    public void setSchemeName(String schemeName) {
        this.schemeName = schemeName;
    }

    public LocalDate getPurchasedDate() {
        return purchasedDate;
    }

    public void setPurchasedDate(LocalDate purchasedDate) {
        this.purchasedDate = purchasedDate;
    }

    public LocalDate getMaturityDate() {
        return maturityDate;
    }

    public void setMaturityDate(LocalDate maturityDate) {
        this.maturityDate = maturityDate;
    }
}

