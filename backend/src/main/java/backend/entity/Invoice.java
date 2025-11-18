package backend.entity;

import jakarta.persistence.*;
import lombok.*;


import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Invoices")
public class Invoice implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(name = "invoice_type", length = 100, nullable = false)
    private String invoiceType;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "invoice_date")
    private LocalDateTime invoiceDate;

    @Column(name = "penalty", precision = 12, scale = 2)
    private BigDecimal penalty;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "payment_method", length = 100)
    private String paymentMethod;

    @Column(name = "payment_intent_id", length = 255)
    private String paymentIntentId;

    @Column(name = "status", length = 50)
    private String status;

    public Invoice() {
    }

    public Invoice(Long invoiceId, String invoiceType, Long bookingId, Long staffId, LocalDateTime invoiceDate, BigDecimal penalty, BigDecimal totalAmount, String paymentMethod, String paymentIntentId, String status) {
        this.invoiceId = invoiceId;
        this.invoiceType = invoiceType;
        this.bookingId = bookingId;
        this.staffId = staffId;
        this.invoiceDate = invoiceDate;
        this.penalty = penalty;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.paymentIntentId = paymentIntentId;
        this.status = status;
    }

    public Long getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Long invoiceId) {
        this.invoiceId = invoiceId;
    }

    public String getInvoiceType() {
        return invoiceType;
    }

    public void setInvoiceType(String invoiceType) {
        this.invoiceType = invoiceType;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public LocalDateTime getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDateTime invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public BigDecimal getPenalty() {
        return penalty;
    }

    public void setPenalty(BigDecimal penalty) {
        this.penalty = penalty;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
