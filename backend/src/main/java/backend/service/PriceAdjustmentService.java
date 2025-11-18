package backend.service;

import backend.entity.PriceAdjustment;
import backend.repository.PriceAdjustmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PriceAdjustmentService {
    @Autowired
    private PriceAdjustmentRepository priceAdjustmentRepository;

    public List<PriceAdjustment> getAllAdjustments() {
        return priceAdjustmentRepository.findAll();
    }

    public PriceAdjustment createAdjustment(PriceAdjustment adjustment) throws IllegalArgumentException {
        if (adjustment.getStartDate().isAfter(adjustment.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        List<PriceAdjustment> overlapping = priceAdjustmentRepository.findOverlappingAdjustments(
                adjustment.getStartDate(),
                adjustment.getEndDate()
        );

        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Time is overlapped with others.");
        }

        return priceAdjustmentRepository.save(adjustment);
    }

    public PriceAdjustment updateAdjustment(Long id, PriceAdjustment adjustmentDetails) throws IllegalArgumentException {
        PriceAdjustment adjustment = priceAdjustmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Not found: " + id));

        if (adjustmentDetails.getStartDate().isAfter(adjustmentDetails.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        List<PriceAdjustment> overlapping = priceAdjustmentRepository.findOverlappingAdjustmentsForUpdate(
                adjustmentDetails.getStartDate(),
                adjustmentDetails.getEndDate(),
                id
        );

        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Time is overlapped with others.");
        }

        adjustment.setName(adjustmentDetails.getName());
        adjustment.setStartDate(adjustmentDetails.getStartDate());
        adjustment.setEndDate(adjustmentDetails.getEndDate());
        adjustment.setAdjustmentType(adjustmentDetails.getAdjustmentType());
        adjustment.setAdjustmentValue(adjustmentDetails.getAdjustmentValue());

        return priceAdjustmentRepository.save(adjustment);
    }

    public void deleteAdjustment(Long id) {
        if (!priceAdjustmentRepository.existsById(id)) {
            throw new IllegalArgumentException("Not found: " + id);
        }
        priceAdjustmentRepository.deleteById(id);
    }

    public BigDecimal calculateTotalPrice(BigDecimal basePrice, LocalDate checkin, LocalDate checkout) {
        List<PriceAdjustment> adjustments = priceAdjustmentRepository.findAll();

        BigDecimal totalPrice = BigDecimal.ZERO;
        LocalDate currentDate = checkin;

        long numberOfNights = java.time.temporal.ChronoUnit.DAYS.between(checkin, checkout);
        if (numberOfNights <= 0) {
            numberOfNights = 1; 
        }

        for (int i = 0; i < numberOfNights; i++) {
            final LocalDate finalCurrentDate = currentDate;

            Optional<PriceAdjustment> applicableAdjustment = adjustments.stream()
                    .filter(adj -> !finalCurrentDate.isBefore(adj.getStartDate()) && !finalCurrentDate.isAfter(adj.getEndDate()))
                    .findFirst();

            BigDecimal dailyPrice;
            if (applicableAdjustment.isPresent()) {
                dailyPrice = getAdjustedDailyPrice(basePrice, applicableAdjustment.get());
            } else {
                dailyPrice = basePrice;
            }

            totalPrice = totalPrice.add(dailyPrice);
            currentDate = currentDate.plusDays(1);
        }

        return totalPrice;
    }

    private BigDecimal getAdjustedDailyPrice(BigDecimal basePrice, PriceAdjustment adjustment) {
        if ("PERCENTAGE".equalsIgnoreCase(adjustment.getAdjustmentType())) {
            BigDecimal percentage = adjustment.getAdjustmentValue().divide(new BigDecimal("100"));
            BigDecimal increaseAmount = basePrice.multiply(percentage);
            return basePrice.add(increaseAmount);
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(adjustment.getAdjustmentType())) {
            return basePrice.add(adjustment.getAdjustmentValue());
        }
        return basePrice;
    }

    public BigDecimal calculateDeposit(BigDecimal totalPrice) {
        BigDecimal depositRate = new BigDecimal("0.30");
        return totalPrice.multiply(depositRate).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateTotalAdjustment(BigDecimal basePrice, LocalDate checkin, LocalDate checkout) {
        List<PriceAdjustment> adjustments = priceAdjustmentRepository.findAll();
        BigDecimal totalAdjustment = BigDecimal.ZERO;
        LocalDate currentDate = checkin;

        long numberOfNights = java.time.temporal.ChronoUnit.DAYS.between(checkin, checkout);
        if (numberOfNights <= 0) {
            numberOfNights = 1; 
        }

        for (int i = 0; i < numberOfNights; i++) {
            final LocalDate finalCurrentDate = currentDate;

            Optional<PriceAdjustment> applicableAdjustment = adjustments.stream()
                    .filter(adj -> !finalCurrentDate.isBefore(adj.getStartDate()) && !finalCurrentDate.isAfter(adj.getEndDate()))
                    .findFirst();

            if (applicableAdjustment.isPresent()) {
                BigDecimal dailyAdjustment;
                PriceAdjustment adj = applicableAdjustment.get();
                if ("PERCENTAGE".equalsIgnoreCase(adj.getAdjustmentType())) {
                    dailyAdjustment = basePrice.multiply(adj.getAdjustmentValue().divide(new BigDecimal("100")));
                } else if ("FIXED_AMOUNT".equalsIgnoreCase(adj.getAdjustmentType())) {
                    dailyAdjustment = adj.getAdjustmentValue();
                } else {
                    dailyAdjustment = BigDecimal.ZERO;
                }
                totalAdjustment = totalAdjustment.add(dailyAdjustment);
            }

            currentDate = currentDate.plusDays(1);
        }

        return totalAdjustment;
    }

}
