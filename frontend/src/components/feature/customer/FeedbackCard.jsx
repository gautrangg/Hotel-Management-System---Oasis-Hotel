import React from "react";
import "@assets/feedback/FeedbackCard.css";

const FeedbackCard = ({ feedback, showBookingInfo = false }) => {
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span
                key={index}
                className={`c-feedback-star ${index < rating ? "filled" : ""}`}
            >
                ★
            </span>
        ));
    };

    return (
        <div className="c-feedback-card">
            <div className="c-feedback-card-header">
                <div className="c-feedback-avatar">
                    <i className="bx bxs-user-circle"></i>
                </div>
                <div className="c-feedback-user-info">
                    <h4 className="c-feedback-customer-name">
                        Customer #{feedback.customerId}
                    </h4>
                    {showBookingInfo && feedback.bookingId && (
                        <p className="c-feedback-booking-ref">
                            Booking #{feedback.bookingId}
                        </p>
                    )}
                </div>
            </div>

            <div className="c-feedback-rating">
                {renderStars(feedback.rating)}
            </div>

            <p className="c-feedback-description">
                {feedback.description}
            </p>

            <div className="c-feedback-card-footer">
                <i className="bx bx-time-five"></i>
                <span className="c-feedback-date">
                    {new Date().toLocaleDateString("vi-VN")}
                </span>
            </div>
        </div>
    );
};

export default FeedbackCard;