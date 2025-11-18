package backend.dto.booking;

public class ConfirmRecepBookingRequestDTO {
    private Long bookingId;

    private String customerName;

    private String customerEmail;

    private String customerPhone;

    private String paymentIntentId;

    private String paymentMethod;
    private Long staffId;

    public ConfirmRecepBookingRequestDTO() {

    }

    public ConfirmRecepBookingRequestDTO(Long bookingId, String customerName, String customerEmail, String customerPhone, String paymentIntentId, String paymentMethod, Long staffId) {
        this.bookingId = bookingId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.paymentIntentId = paymentIntentId;
        this.paymentMethod = paymentMethod;
        this.staffId = staffId;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

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

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
