import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@assets/feedback/AllFeedbacks.css";
import CustomerHeader from "@components/layout/CustomerHeader.jsx";
import FeedbackCard from "@components/feature/customer/FeedbackCard.jsx";
import { getAuthHeaders } from "@utils/auth";


const AllFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterRating, setFilterRating] = useState("ALL");
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllFeedbacks();
    }, []);

    const fetchAllFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8080/api/feedbacks/all", {
                headers: getAuthHeaders("application/json")
            });
            
            if (!response.ok) {
                throw new Error("Failed to fetch feedbacks");
            }
            
            const data = await response.json();
            setFeedbacks(data);
        } catch (err) {
            console.error("Error fetching feedbacks:", err);
            setError("Không thể tải feedbacks. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const getFilteredFeedbacks = () => {
        if (filterRating === "ALL") {
            return feedbacks;
        }
        return feedbacks.filter(f => f.rating === parseInt(filterRating));
    };

    const getRatingCount = (rating) => {
        if (rating === "ALL") return feedbacks.length;
        return feedbacks.filter(f => f.rating === parseInt(rating)).length;
    };

    const getAverageRating = () => {
        if (feedbacks.length === 0) return 0;
        const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
        return (sum / feedbacks.length).toFixed(1);
    };

    const filteredFeedbacks = getFilteredFeedbacks();

    if (loading) {
        return (
            <>
                <CustomerHeader />
                <div className="c-all-feedbacks-container">
                    <div className="c-all-feedbacks-loading">
                        <i className="bx bx-loader-alt bx-spin"></i>
                        <p>Loading feedbacks...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <CustomerHeader />
                <div className="c-all-feedbacks-container">
                    <div className="c-all-feedbacks-error">
                        <i className="bx bx-error-circle"></i>
                        <p>{error}</p>
                        <button onClick={fetchAllFeedbacks} className="c-retry-btn">
                            Try Again
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <CustomerHeader />
            <div className="c-all-feedbacks-container">
                <div className="c-all-feedbacks-header">
                    <button className="c-back-btn" onClick={() => navigate(-1)}>
                        <i className="bx bx-arrow-back"></i>
                        Back
                    </button>
                    <h1 className="c-all-feedbacks-title">Guest Reviews</h1>
                    <p className="c-all-feedbacks-subtitle">
                        What our guests say about their experience
                    </p>
                </div>

                {feedbacks.length > 0 && (
                    <div className="c-all-feedbacks-stats">
                        <div className="c-stats-card">
                            <div className="c-stats-icon">
                                <i className="bx bxs-star"></i>
                            </div>
                            <div className="c-stats-content">
                                <h3>{getAverageRating()}</h3>
                                <p>Average Rating</p>
                            </div>
                        </div>
                        <div className="c-stats-card">
                            <div className="c-stats-icon">
                                <i className="bx bxs-message-square-detail"></i>
                            </div>
                            <div className="c-stats-content">
                                <h3>{feedbacks.length}</h3>
                                <p>Total Reviews</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="c-all-feedbacks-filters">
                    {["ALL", "5", "4", "3", "2", "1"].map((rating) => (
                        <button
                            key={rating}
                            className={`c-filter-btn ${filterRating === rating ? "active" : ""}`}
                            onClick={() => setFilterRating(rating)}
                        >
                            {rating === "ALL" ? (
                                <>All ({getRatingCount(rating)})</>
                            ) : (
                                <>
                                    {rating} <i className="bx bxs-star"></i> ({getRatingCount(rating)})
                                </>
                            )}
                        </button>
                    ))}
                </div>

                {filteredFeedbacks.length === 0 ? (
                    <div className="c-all-feedbacks-empty">
                        <i className="bx bx-message-square-x"></i>
                        <h3>No reviews found</h3>
                        <p>
                            {filterRating === "ALL"
                                ? "Be the first to leave a review!"
                                : `No ${filterRating}-star reviews yet`}
                        </p>
                    </div>
                ) : (
                    <div className="c-all-feedbacks-grid">
                        {filteredFeedbacks.map((feedback) => (
                            <FeedbackCard
                                key={feedback.feedbackId}
                                feedback={feedback}
                                showBookingInfo={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default AllFeedbacks;