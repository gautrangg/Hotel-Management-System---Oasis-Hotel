package backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "PriceAdjustments")
public class PriceAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "adjustment_id")
    private Long adjustmentId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "adjustment_type", nullable = false)
    private String adjustmentType;

    @Column(name = "adjustment_value", nullable = false)
    private BigDecimal adjustmentValue;

    public PriceAdjustment() {
    }

    public PriceAdjustment(Long adjustmentId, String name, LocalDate startDate, LocalDate endDate, String adjustmentType, BigDecimal adjustmentValue) {
        this.adjustmentId = adjustmentId;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.adjustmentType = adjustmentType;
        this.adjustmentValue = adjustmentValue;
    }

    public Long getAdjustmentId() {
        return adjustmentId;
    }

    public void setAdjustmentId(Long adjustmentId) {
        this.adjustmentId = adjustmentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getAdjustmentType() {
        return adjustmentType;
    }

    public void setAdjustmentType(String adjustmentType) {
        this.adjustmentType = adjustmentType;
    }

    public BigDecimal getAdjustmentValue() {
        return adjustmentValue;
    }

    public void setAdjustmentValue(BigDecimal adjustmentValue) {
        this.adjustmentValue = adjustmentValue;
    }
}
