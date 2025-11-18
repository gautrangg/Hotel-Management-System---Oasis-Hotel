package backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "Feedbacks")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Long feedbackId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "rating")
    private Integer rating; // 1–5

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    public Feedback() {
    }

    public Feedback(Long feedbackId, Long customerId, Long bookingId, Integer rating, String description) {
        this.feedbackId = feedbackId;
        this.customerId = customerId;
        this.bookingId = bookingId;
        this.rating = rating;
        this.description = description;
    }

    public Long getFeedbackId() {
        return feedbackId;
    }

    public void setFeedbackId(Long feedbackId) {
        this.feedbackId = feedbackId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
