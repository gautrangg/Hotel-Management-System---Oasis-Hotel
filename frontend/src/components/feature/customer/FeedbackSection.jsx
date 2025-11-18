import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FeedbackCard from "./FeedbackCard";
import "@assets/feedback/FeedbackSection.css";

const FeedbackSection = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8080/api/feedbacks/latest?limit=10");
            
            if (!response.ok) {
                throw new Error("Failed to fetch feedbacks");
            }
            
            const data = await response.json();
            setFeedbacks(data);
        } catch (err) {
            console.error("Error fetching feedbacks:", err);
            setError("Không thể tải feedbacks");
        } finally {
            setLoading(false);
        }
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -400,
                behavior: "smooth"
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 400,
                behavior: "smooth"
            });
        }
    };

    const handleViewAll = () => {
        navigate("/feedbacks");
    };

    if (loading) {
        return (
            <div className="c-feedback-section">
                <div className="c-feedback-section-loading">
                    <i className="c-bx c-bx-loader-alt c-bx-spin"></i>
                    <p>Loading feedbacks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return null; // Don't show error, just hide the section
    }

    if (feedbacks.length === 0) {
        return null; // Don't show section if no feedbacks
    }

    return (
        <div className="c-feedback-section">
            <div className="c-feedback-section-header">
                <div className="c-feedback-section-title-group">
                    <p className="c-feedback-section-subtitle">WHAT OUR GUESTS SAY</p>
                    <h2 className="c-feedback-section-title">Guest Reviews</h2>
                    <p className="c-feedback-section-description">
                        Read what our guests have to say about their experience at The Oasis Hotel
                    </p>
                </div>
                <button className="c-feedback-view-all-btn" onClick={handleViewAll}>
                    View All Reviews
                    <i className="c-bx c-bx-right-arrow-alt"></i>
                </button>
            </div>

            <div className="c-feedback-carousel-wrapper">
                <button 
                    className="c-feedback-carousel-nav c-feedback-nav-left"
                    onClick={scrollLeft}
                    aria-label="Scroll left"
                >
                    <i className="bx bx-chevron-left"></i>
                </button>

                <div className="c-feedback-carousel-container" ref={scrollContainerRef}>
                    <div className="c-feedback-carousel-track">
                        {feedbacks.map((feedback) => (
                            <div key={feedback.feedbackId} className="c-feedback-carousel-item">
                                <FeedbackCard feedback={feedback} showBookingInfo={false} />
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    className="c-feedback-carousel-nav c-feedback-nav-right"
                    onClick={scrollRight}
                    aria-label="Scroll right"
                >
                    <i className="bx bx-chevron-right"></i>
                </button>
            </div>
        </div>
    );
};

export default FeedbackSection;