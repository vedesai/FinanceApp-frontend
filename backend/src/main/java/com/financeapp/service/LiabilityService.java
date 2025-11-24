package com.financeapp.service;

import com.financeapp.entity.Liability;
import com.financeapp.repository.LiabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LiabilityService {
    @Autowired
    private LiabilityRepository liabilityRepository;

    public List<Liability> getAllLiabilities() {
        return liabilityRepository.findAll();
    }

    public Optional<Liability> getLiabilityById(Long id) {
        return liabilityRepository.findById(id);
    }

    public Liability createLiability(Liability liability) {
        return liabilityRepository.save(liability);
    }

    public Liability updateLiability(Long id, Liability liabilityDetails) {
        Liability liability = liabilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Liability not found with id: " + id));
        
        liability.setName(liabilityDetails.getName());
        liability.setLiabilityType(liabilityDetails.getLiabilityType());
        liability.setAmount(liabilityDetails.getAmount());
        liability.setDescription(liabilityDetails.getDescription());
        
        return liabilityRepository.save(liability);
    }

    public void deleteLiability(Long id) {
        Liability liability = liabilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Liability not found with id: " + id));
        liabilityRepository.delete(liability);
    }
}

