package backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "ServiceRequests")
public class ServiceRequest implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "service_id", nullable = false)
    private Long serviceId;

    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "expected_time")
    private LocalDateTime expectedTime;

    @Column(name = "request_time")
    private LocalDateTime requestTime = LocalDateTime.now();

    @Column(name = "note")
    private String note;

    @Column(name = "status")
    private String status;

    public ServiceRequest() {}

    public ServiceRequest(Long requestId, Long bookingId, Long serviceId, Long staffId, Integer quantity, LocalDateTime expectedTime, LocalDateTime requestTime, String note, String status) {
        this.requestId = requestId;
        this.bookingId = bookingId;
        this.serviceId = serviceId;
        this.staffId = staffId;
        this.quantity = quantity;
        this.expectedTime = expectedTime;
        this.requestTime = requestTime;
        this.note = note;
        this.status = status;
    }

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public LocalDateTime getExpectedTime() {
        return expectedTime;
    }

    public void setExpectedTime(LocalDateTime expectedTime) {
        this.expectedTime = expectedTime;
    }

    public LocalDateTime getRequestTime() { return requestTime; }
    public void setRequestTime(LocalDateTime requestTime) { this.requestTime = requestTime; }

    public String getNote() {
        return note;
    }
    public void setNote(String note) {
        this.note = note;
    }


    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
