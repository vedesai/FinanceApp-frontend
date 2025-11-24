package com.financeapp.repository;

import com.financeapp.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    Optional<Investment> findByExternalIdAndProviderBroker(String externalId, String providerBroker);
}

