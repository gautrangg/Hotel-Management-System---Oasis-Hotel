package backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO cho cập nhật booking từ admin
 */
public class AdminBookingUpdateDTO {
    
    private Long bookingId;
    private Long roomId;
    private LocalDateTime checkinDate;
    private LocalDateTime checkoutDate;
    private String status;
    private BigDecimal deposit;
    private String contactName;
    private String contactPhone;
    private String contactEmail;
    private List<GuestDetailUpdateDTO> guestDetails;
    private List<ServiceRequestDTO> pendingServices;
    
    public AdminBookingUpdateDTO() {}
    
    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }
    
    public Long getRoomId() {
        return roomId;
    }
    
    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }
    
    public LocalDateTime getCheckinDate() {
        return checkinDate;
    }
    
    public void setCheckinDate(LocalDateTime checkinDate) {
        this.checkinDate = checkinDate;
    }
    
    public LocalDateTime getCheckoutDate() {
        return checkoutDate;
    }
    
    public void setCheckoutDate(LocalDateTime checkoutDate) {
        this.checkoutDate = checkoutDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public BigDecimal getDeposit() {
        return deposit;
    }
    
    public void setDeposit(BigDecimal deposit) {
        this.deposit = deposit;
    }
    
    public String getContactName() {
        return contactName;
    }
    
    public void setContactName(String contactName) {
        this.contactName = contactName;
    }
    
    public String getContactPhone() {
        return contactPhone;
    }
    
    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }
    
    public String getContactEmail() {
        return contactEmail;
    }
    
    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }
    
    public List<GuestDetailUpdateDTO> getGuestDetails() {
        return guestDetails;
    }
    
    public void setGuestDetails(List<GuestDetailUpdateDTO> guestDetails) {
        this.guestDetails = guestDetails;
    }
    
    public List<ServiceRequestDTO> getPendingServices() {
        return pendingServices;
    }
    
    public void setPendingServices(List<ServiceRequestDTO> pendingServices) {
        this.pendingServices = pendingServices;
    }
    
    /**
     * DTO cho cập nhật thông tin khách đi cùng
     */
    public static class GuestDetailUpdateDTO {
        private Integer guestDetailId; // null nếu là thêm mới
        private String fullName;
        private String gender;
        private String citizenId;
        private String action; // "CREATE", "UPDATE", "DELETE"
        
        public GuestDetailUpdateDTO() {}
        
        public GuestDetailUpdateDTO(Integer guestDetailId, String fullName, String gender, String citizenId, String action) {
            this.guestDetailId = guestDetailId;
            this.fullName = fullName;
            this.gender = gender;
            this.citizenId = citizenId;
            this.action = action;
        }
        
        // Getters and Setters
        public Integer getGuestDetailId() {
            return guestDetailId;
        }
        
        public void setGuestDetailId(Integer guestDetailId) {
            this.guestDetailId = guestDetailId;
        }
        
        public String getFullName() {
            return fullName;
        }
        
        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
        
        public String getGender() {
            return gender;
        }
        
        public void setGender(String gender) {
            this.gender = gender;
        }
        
        public String getCitizenId() {
            return citizenId;
        }
        
        public void setCitizenId(String citizenId) {
            this.citizenId = citizenId;
        }
        
        public String getAction() {
            return action;
        }
        
        public void setAction(String action) {
            this.action = action;
        }
    }
    
    /**
     * DTO cho service request trong pending services
     */
    public static class ServiceRequestDTO {
        private Long serviceId;
        private Integer quantity;
        private String serviceName;
        private BigDecimal pricePerUnit;
        private BigDecimal total;
        
        public ServiceRequestDTO() {}
        
        public ServiceRequestDTO(Long serviceId, Integer quantity, String serviceName, 
                               BigDecimal pricePerUnit, BigDecimal total) {
            this.serviceId = serviceId;
            this.quantity = quantity;
            this.serviceName = serviceName;
            this.pricePerUnit = pricePerUnit;
            this.total = total;
        }
        
        // Getters and Setters
        public Long getServiceId() {
            return serviceId;
        }
        
        public void setServiceId(Long serviceId) {
            this.serviceId = serviceId;
        }
        
        public Integer getQuantity() {
            return quantity;
        }
        
        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
        
        public String getServiceName() {
            return serviceName;
        }
        
        public void setServiceName(String serviceName) {
            this.serviceName = serviceName;
        }
        
        public BigDecimal getPricePerUnit() {
            return pricePerUnit;
        }
        
        public void setPricePerUnit(BigDecimal pricePerUnit) {
            this.pricePerUnit = pricePerUnit;
        }
        
        public BigDecimal getTotal() {
            return total;
        }
        
        public void setTotal(BigDecimal total) {
            this.total = total;
        }
    }
}
