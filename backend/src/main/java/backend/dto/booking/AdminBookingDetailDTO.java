package backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO cho chi tiết booking trong trang quản lý admin
 * Bao gồm thông tin booking và danh sách GuestDetails
 */
public class AdminBookingDetailDTO {
    
    private Long bookingId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerCitizenId;
    private String roomNumber;
    private String roomTypeName;
    private BigDecimal roomPrice;
    private Long roomId;
    private Long roomTypeId;
    private LocalDateTime checkinDate;
    private LocalDateTime checkoutDate;
    private LocalDateTime actualCheckin;
    private LocalDateTime actualCheckout;
    private String status;
    private BigDecimal deposit;
    private LocalDateTime createAt;
    private Integer numberOfGuests;
    private String contactName;
    private String contactPhone;
    private String contactEmail;
    
    private List<GuestDetailDTO> guestDetails;
    private List<ServiceRequestDTO> serviceRequests;
    
    public AdminBookingDetailDTO() {}
    
    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public String getCustomerPhone() {
        return customerPhone;
    }
    
    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }
    
    public String getCustomerEmail() {
        return customerEmail;
    }
    
    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
    
    public String getCustomerCitizenId() {
        return customerCitizenId;
    }
    
    public void setCustomerCitizenId(String customerCitizenId) {
        this.customerCitizenId = customerCitizenId;
    }
    
    public String getRoomNumber() {
        return roomNumber;
    }
    
    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }
    
    public String getRoomTypeName() {
        return roomTypeName;
    }
    
    public void setRoomTypeName(String roomTypeName) {
        this.roomTypeName = roomTypeName;
    }
    
    public BigDecimal getRoomPrice() {
        return roomPrice;
    }
    
    public void setRoomPrice(BigDecimal roomPrice) {
        this.roomPrice = roomPrice;
    }
    
    public Long getRoomId() {
        return roomId;
    }
    
    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }
    
    public Long getRoomTypeId() {
        return roomTypeId;
    }
    
    public void setRoomTypeId(Long roomTypeId) {
        this.roomTypeId = roomTypeId;
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
    
    public LocalDateTime getActualCheckin() {
        return actualCheckin;
    }
    
    public void setActualCheckin(LocalDateTime actualCheckin) {
        this.actualCheckin = actualCheckin;
    }
    
    public LocalDateTime getActualCheckout() {
        return actualCheckout;
    }
    
    public void setActualCheckout(LocalDateTime actualCheckout) {
        this.actualCheckout = actualCheckout;
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
    
    public LocalDateTime getCreateAt() {
        return createAt;
    }
    
    public void setCreateAt(LocalDateTime createAt) {
        this.createAt = createAt;
    }
    
    public Integer getNumberOfGuests() {
        return numberOfGuests;
    }
    
    public void setNumberOfGuests(Integer numberOfGuests) {
        this.numberOfGuests = numberOfGuests;
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
    
    public List<GuestDetailDTO> getGuestDetails() {
        return guestDetails;
    }
    
    public void setGuestDetails(List<GuestDetailDTO> guestDetails) {
        this.guestDetails = guestDetails;
    }
    
    public List<ServiceRequestDTO> getServiceRequests() {
        return serviceRequests;
    }
    
    public void setServiceRequests(List<ServiceRequestDTO> serviceRequests) {
        this.serviceRequests = serviceRequests;
    }
    
    /**
     * DTO cho thông tin khách đi cùng
     */
    public static class GuestDetailDTO {
        private Long guestDetailId;
        private String fullName;
        private String gender;
        private String citizenId;
        
        public GuestDetailDTO() {}
        
        public GuestDetailDTO(Long guestDetailId, String fullName, String gender, String citizenId) {
            this.guestDetailId = guestDetailId;
            this.fullName = fullName;
            this.gender = gender;
            this.citizenId = citizenId;
        }
        
        // Getters and Setters
        public Long getGuestDetailId() {
            return guestDetailId;
        }
        
        public void setGuestDetailId(Long guestDetailId) {
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
    }
    
    /**
     * DTO cho service request
     */
    public static class ServiceRequestDTO {
        private Long serviceRequestId;
        private String serviceName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String status;
        
        public ServiceRequestDTO() {}
        
        // Getters and Setters
        public Long getServiceRequestId() {
            return serviceRequestId;
        }
        
        public void setServiceRequestId(Long serviceRequestId) {
            this.serviceRequestId = serviceRequestId;
        }
        
        public String getServiceName() {
            return serviceName;
        }
        
        public void setServiceName(String serviceName) {
            this.serviceName = serviceName;
        }
        
        public Integer getQuantity() {
            return quantity;
        }
        
        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
        
        public BigDecimal getUnitPrice() {
            return unitPrice;
        }
        
        public void setUnitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }
        
        public BigDecimal getTotalPrice() {
            return totalPrice;
        }
        
        public void setTotalPrice(BigDecimal totalPrice) {
            this.totalPrice = totalPrice;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
    }
}
