package backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO đầy đủ cho màn hình Booking Detail
 * Chứa: Room info, Customer info, Services, Invoice data
 */
public class BookingDetailFullDTO {

    private Long bookingId;
    private String status;
    private LocalDateTime createAt;
    private LocalDateTime checkinDate;
    private LocalDateTime checkoutDate;
    private Integer adult;
    private Integer children;

    private RoomInfoDTO room;

    private CustomerInfoDTO customer;

    private LocalDateTime actualCheckin;
    private LocalDateTime actualCheckout;

    private List<ServiceRequestDTO> services;

    private InvoiceDataDTO invoiceData;

    public BookingDetailFullDTO() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreateAt() { return createAt; }
    public void setCreateAt(LocalDateTime createAt) { this.createAt = createAt; }

    public LocalDateTime getCheckinDate() { return checkinDate; }
    public void setCheckinDate(LocalDateTime checkinDate) { this.checkinDate = checkinDate; }

    public LocalDateTime getCheckoutDate() { return checkoutDate; }
    public void setCheckoutDate(LocalDateTime checkoutDate) { this.checkoutDate = checkoutDate; }

    public Integer getAdult() {
        return adult;
    }

    public void setAdult(Integer adult) {
        this.adult = adult;
    }

    public Integer getChildren() {
        return children;
    }

    public void setChildren(Integer children) {
        this.children = children;
    }

    public RoomInfoDTO getRoom() { return room; }
    public void setRoom(RoomInfoDTO room) { this.room = room; }

    public CustomerInfoDTO getCustomer() { return customer; }
    public void setCustomer(CustomerInfoDTO customer) { this.customer = customer; }

    public LocalDateTime getActualCheckin() { return actualCheckin; }
    public void setActualCheckin(LocalDateTime actualCheckin) { this.actualCheckin = actualCheckin; }

    public LocalDateTime getActualCheckout() { return actualCheckout; }
    public void setActualCheckout(LocalDateTime actualCheckout) { this.actualCheckout = actualCheckout; }

    public List<ServiceRequestDTO> getServices() { return services; }
    public void setServices(List<ServiceRequestDTO> services) { this.services = services; }

    public InvoiceDataDTO getInvoiceData() { return invoiceData; }
    public void setInvoiceData(InvoiceDataDTO invoiceData) { this.invoiceData = invoiceData; }

    // ============ NESTED CLASSES ============

    public static class RoomInfoDTO {
        private Long roomId;
        private String roomNumber;
        private String roomTypeName;
        private BigDecimal pricePerNight;
        private String description;
        private String imageUrl;

        public RoomInfoDTO() {}

        public Long getRoomId() { return roomId; }
        public void setRoomId(Long roomId) { this.roomId = roomId; }

        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

        public String getRoomTypeName() { return roomTypeName; }
        public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }

        public BigDecimal getPricePerNight() { return pricePerNight; }
        public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static class CustomerInfoDTO {
        private String name;
        private String phone;
        private String email;

        public CustomerInfoDTO() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ServiceRequestDTO {
        private Long requestId;
        private Long serviceId;
        private String serviceName;
        private String imageUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String status;
        private LocalDateTime requestTime;
        private String note;

        public ServiceRequestDTO() {}

        public Long getRequestId() { return requestId; }
        public void setRequestId(Long requestId) { this.requestId = requestId; }

        public Long getServiceId() { return serviceId; }
        public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

        public BigDecimal getTotalPrice() { return totalPrice; }
        public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public LocalDateTime getRequestTime() { return requestTime; }
        public void setRequestTime(LocalDateTime requestTime) { this.requestTime = requestTime; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }

    public static class InvoiceDataDTO {
        private String invoiceId;
        private LocalDateTime invoiceDate;
        private BigDecimal roomPrice;
        private Long numberOfNights;
        private BigDecimal lateCheckoutFee;
        private BigDecimal deposit;
        private BigDecimal servicesTotal;
        private BigDecimal totalAmount;

        public InvoiceDataDTO() {}

        public String getInvoiceId() { return invoiceId; }
        public void setInvoiceId(String invoiceId) { this.invoiceId = invoiceId; }

        public LocalDateTime getInvoiceDate() { return invoiceDate; }
        public void setInvoiceDate(LocalDateTime invoiceDate) { this.invoiceDate = invoiceDate; }

        public BigDecimal getRoomPrice() { return roomPrice; }
        public void setRoomPrice(BigDecimal roomPrice) { this.roomPrice = roomPrice; }

        public Long getNumberOfNights() { return numberOfNights; }
        public void setNumberOfNights(Long numberOfNights) { this.numberOfNights = numberOfNights; }

        public BigDecimal getLateCheckoutFee() { return lateCheckoutFee; }
        public void setLateCheckoutFee(BigDecimal lateCheckoutFee) { this.lateCheckoutFee = lateCheckoutFee; }

        public BigDecimal getDeposit() { return deposit; }
        public void setDeposit(BigDecimal deposit) { this.deposit = deposit; }

        public BigDecimal getServicesTotal() { return servicesTotal; }
        public void setServicesTotal(BigDecimal servicesTotal) { this.servicesTotal = servicesTotal; }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    }
}