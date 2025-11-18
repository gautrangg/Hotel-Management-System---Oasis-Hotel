import React, { useState, useEffect } from "react";
import "@assets/feedback/FeedbackPopup.css";
import Swal from "sweetalert2"; // ✅ Thêm import này

export default function FeedbackPopup({ 
    isOpen, 
    onClose, 
    bookingId, 
    existingFeedback = null,
    onSuccess 
}) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [mode, setMode] = useState("create");

    useEffect(() => {
        if (existingFeedback) {
            setMode("view");
            setRating(existingFeedback.rating || 0);
            setDescription(existingFeedback.description || "");
        } else {
            setMode("create");
            setRating(0);
            setDescription("");
        }
        setError("");
    }, [existingFeedback, isOpen]);

    const handleStarClick = (star) => {
        if (mode !== "view") {
            setRating(star);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            setError("Please select star rating");
            return;
        }

        if (description.length > 300) {
            setError("Description must not exceed 300 characters");
            return;
        }

        setSubmitting(true);
        setError("");

        const token = localStorage.getItem("token");
        
        let customerId = null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            customerId = payload.id;
        } catch (err) {
            setError("Unable to authenticate user");
            setSubmitting(false);
            return;
        }
        
        const url = mode === "edit" && existingFeedback
            ? `http://localhost:8080/api/feedbacks/${existingFeedback.feedbackId}`
            : "http://localhost:8080/api/feedbacks";
        
        const method = mode === "edit" ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bookingId,
                    customerId,
                    rating,
                    description,
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText);
            }

            // ✅ Thay alert bằng Swal2
            Swal.fire({
                icon: "success",
                title: mode === "edit" ? "Updated!" : "Sent!",
                text: mode === "edit" ? "Feedback updated successfully!" : "Feedback sent successfully!",
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                setMode("view");
                onSuccess?.();
                onClose();
            });
            
        } catch (err) {
            setError(err.message || "Error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Delete Feedback?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            reverseButtons: true,
        });

        if (!result.isConfirmed) {
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem("token");
        
        let customerId = null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            customerId = payload.id;
        } catch (err) {
            setError("Unable to authenticate user");
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:8080/api/feedbacks/${existingFeedback.feedbackId}?customerId=${customerId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText);
            }

            // ✅ Thay alert bằng Swal2
            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Feedback deleted successfully!",
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                onSuccess?.();
                onClose(); // ✅ Đóng popup sau khi Swal2 đóng
            });
        } catch (err) {
            setError(err.message || "Error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const switchToEditMode = () => {
        setMode("edit");
    };

    if (!isOpen) return null;

    const isReadOnly = mode === "view";

    return (
        <div className="c-feedback-modal-overlay" onClick={onClose}>
            <div className="c-feedback-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="c-feedback-close-btn" onClick={onClose}>
                    ×
                </button>

                <div className="c-feedback-header">
                    <h2 className="c-feedback-title">
                        {mode === "create" && "Feedback"}
                        {mode === "view" && "Your Feedback"}
                        {mode === "edit" && "Edit Feedback"}
                    </h2>
                </div>

                <div className="c-feedback-body">
                    <div className="c-feedback-rating-section">
                        <label className="c-feedback-label">
                            Rate <span className="c-feedback-required">*</span>
                        </label>
                        <div className="c-feedback-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`c-feedback-star ${
                                        star <= (hoveredRating || rating) ? "c-feedback-star-filled" : ""
                                    } ${isReadOnly ? "c-feedback-star-readonly" : ""}`}
                                    onClick={() => handleStarClick(star)}
                                    onMouseEnter={() => !isReadOnly && setHoveredRating(star)}
                                    onMouseLeave={() => !isReadOnly && setHoveredRating(0)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="c-feedback-description-section">
                        <label className="c-feedback-label">
                            Feedback 
                        </label>
                        <textarea
                            className="c-feedback-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Share your experience..."
                            maxLength={300}
                            disabled={isReadOnly}
                        />
                        <div className="c-feedback-char-count">
                            {description.length}/300
                        </div>
                    </div>

                    {error && <div className="c-feedback-error">{error}</div>}
                </div>

                <div className="c-feedback-footer">
                    {mode === "view" && (
                        <>
                            <button
                                className="c-feedback-btn c-feedback-btn-delete"
                                onClick={handleDelete}
                                disabled={submitting}
                            >
                                {submitting ? "Đang xóa..." : "Delete"}
                            </button>
                            <button
                                className="c-feedback-btn c-feedback-btn-edit"
                                onClick={switchToEditMode}
                            >
                                Edit
                            </button>
                        </>
                    )}

                    {mode === "create" && (
                        <>
                            <button
                                className="c-feedback-btn c-feedback-btn-cancel"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="c-feedback-btn c-feedback-btn-send"
                                onClick={handleSubmit}
                                disabled={submitting || rating === 0}
                            >
                                {submitting ? "Sending..." : "Send Feedback"}
                            </button>
                        </>
                    )}

                    {mode === "edit" && (
                        <>
                            <button
                                className="c-feedback-btn c-feedback-btn-cancel"
                                onClick={() => setMode("view")}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="c-feedback-btn c-feedback-btn-send"
                                onClick={handleSubmit}
                                disabled={submitting || rating === 0}
                            >
                                {submitting ? "Đang lưu..." : "Save"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}