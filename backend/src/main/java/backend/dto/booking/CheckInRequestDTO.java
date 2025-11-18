package backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CheckInRequestDTO {
    private Long roomId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerCitizenId;
    private BigDecimal deposit;
    private LocalDateTime actualCheckin;
    private List<GuestDetailDTO> guestDetails;

    // Getters and Setters
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    
    public String getCustomerCitizenId() { return customerCitizenId; }
    public void setCustomerCitizenId(String customerCitizenId) { this.customerCitizenId = customerCitizenId; }
    
    
    public BigDecimal getDeposit() { return deposit; }
    public void setDeposit(BigDecimal deposit) { this.deposit = deposit; }
    
    public LocalDateTime getActualCheckin() { return actualCheckin; }
    public void setActualCheckin(LocalDateTime actualCheckin) { this.actualCheckin = actualCheckin; }
    
    public List<GuestDetailDTO> getGuestDetails() { return guestDetails; }
    public void setGuestDetails(List<GuestDetailDTO> guestDetails) { this.guestDetails = guestDetails; }
}