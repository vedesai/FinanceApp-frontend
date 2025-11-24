package com.financeapp.service;

import com.financeapp.entity.Investment;
import com.financeapp.repository.InvestmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class InvestmentService {
    @Autowired
    private InvestmentRepository investmentRepository;

    public List<Investment> getAllInvestments() {
        return investmentRepository.findAll();
    }

    public Optional<Investment> getInvestmentById(Long id) {
        return investmentRepository.findById(id);
    }

    public Investment createInvestment(Investment investment) {
        return investmentRepository.save(investment);
    }

    public Investment updateInvestment(Long id, Investment investmentDetails) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investment not found with id: " + id));
        
        investment.setInvestmentType(investmentDetails.getInvestmentType());
        investment.setProviderBroker(investmentDetails.getProviderBroker());
        investment.setInvestmentAmount(investmentDetails.getInvestmentAmount());
        investment.setCurrentAmount(investmentDetails.getCurrentAmount());
        investment.setPurchasedDate(investmentDetails.getPurchasedDate());
        investment.setMaturityDate(investmentDetails.getMaturityDate());
        
        return investmentRepository.save(investment);
    }

    public void deleteInvestment(Long id) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investment not found with id: " + id));
        investmentRepository.delete(investment);
    }
}

