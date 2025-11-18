package backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "Services")
public class Service implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "service_name", nullable = false, length = 255)
    private String serviceName;

    @Column(name = "image", columnDefinition = "NVARCHAR(MAX)")
    private String image;

    @Column(name = "price_per_unit", nullable = false, precision = 18, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "available_start_time")
    private LocalTime availableStartTime;

    @Column(name = "available_end_time")
    private LocalTime availableEndTime;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "need_staff")
    private Boolean needStaff;

    @Column(name = "is_active")
    private Boolean isActive;

    public Service() {
    }

    public Service(Long serviceId, Long categoryId, String serviceName, String image, BigDecimal pricePerUnit, String unit, LocalTime availableStartTime, LocalTime availableEndTime, String description, Boolean needStaff, Boolean isActive) {
        this.serviceId = serviceId;
        this.categoryId = categoryId;
        this.serviceName = serviceName;
        this.image = image;
        this.pricePerUnit = pricePerUnit;
        this.unit = unit;
        this.availableStartTime = availableStartTime;
        this.availableEndTime = availableEndTime;
        this.description = description;
        this.needStaff = needStaff;
        this.isActive = isActive;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public BigDecimal getPricePerUnit() {
        return pricePerUnit;
    }

    public void setPricePerUnit(BigDecimal pricePerUnit) {
        this.pricePerUnit = pricePerUnit;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public LocalTime getAvailableStartTime() {
        return availableStartTime;
    }

    public void setAvailableStartTime(LocalTime availableStartTime) {
        this.availableStartTime = availableStartTime;
    }

    public LocalTime getAvailableEndTime() {
        return availableEndTime;
    }

    public void setAvailableEndTime(LocalTime availableEndTime) {
        this.availableEndTime = availableEndTime;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getNeedStaff() {
        return needStaff;
    }

    public void setNeedStaff(Boolean needStaff) {
        this.needStaff = needStaff;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }
}
