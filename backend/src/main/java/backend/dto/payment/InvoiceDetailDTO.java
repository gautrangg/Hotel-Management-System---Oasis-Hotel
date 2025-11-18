package backend.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class InvoiceDetailDTO {

    private Long bookingId;
    private String customerName;
    private LocalDateTime actualCheckin;
    private LocalDateTime expectedCheckoutDate;
    private List<RoomChargeDTO> roomCharges;
    private List<ServiceChargeDTO> usedServices;

    public BigDecimal getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(BigDecimal subTotal) {
        this.subTotal = subTotal;
    }

    public BigDecimal getDeposit() {
        return deposit;
    }

    public void setDeposit(BigDecimal deposit) {
        this.deposit = deposit;
    }

    private BigDecimal subTotal; // Tổng tiền phòng + dịch vụ
    private BigDecimal deposit;  // Tiền cọc
    private BigDecimal totalAmount; // Số tiền cuối cùng cần thanh toán

    // Lớp con cho chi phí phòng
    public static class RoomChargeDTO {
        private String roomNumber;
        private String roomTypeName;
        private BigDecimal price;
        private long numberOfNights;
        private BigDecimal total;

        // CONSTRUCTOR CẦN THÊM ĐỂ FIX LỖI
        public RoomChargeDTO(String roomNumber, String roomTypeName, BigDecimal price, long numberOfNights, BigDecimal total) {
            this.roomNumber = roomNumber;
            this.roomTypeName = roomTypeName;
            this.price = price;
            this.numberOfNights = numberOfNights;
            this.total = total;
        }
        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
        public String getRoomTypeName() { return roomTypeName; }
        public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public long getNumberOfNights() { return numberOfNights; }
        public void setNumberOfNights(long numberOfNights) { this.numberOfNights = numberOfNights; }
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }

    }

    public static class ServiceChargeDTO {
        private String serviceName;
        private int quantity;
        private BigDecimal pricePerUnit;
        private BigDecimal total;

        public ServiceChargeDTO(String serviceName, int quantity, BigDecimal pricePerUnit, BigDecimal total) {
            this.serviceName = serviceName;
            this.quantity = quantity;
            this.pricePerUnit = pricePerUnit;
            this.total = total;
        }

        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public BigDecimal getPricePerUnit() { return pricePerUnit; }
        public void setPricePerUnit(BigDecimal pricePerUnit) { this.pricePerUnit = pricePerUnit; }
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
    }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public LocalDateTime getExpectedCheckoutDate() { return expectedCheckoutDate; }
    public void setExpectedCheckoutDate(LocalDateTime expectedCheckoutDate) { this.expectedCheckoutDate = expectedCheckoutDate; }
    public LocalDateTime getActualCheckin() { return actualCheckin; }
    public void setActualCheckin(LocalDateTime actualCheckin) { this.actualCheckin = actualCheckin; }
    public List<RoomChargeDTO> getRoomCharges() { return roomCharges; }
    public void setRoomCharges(List<RoomChargeDTO> roomCharges) { this.roomCharges = roomCharges; }
    public List<ServiceChargeDTO> getUsedServices() { return usedServices; }
    public void setUsedServices(List<ServiceChargeDTO> usedServices) { this.usedServices = usedServices; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
}