import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@assets/booking/MyBookings.css";
import CustomerHeader from "@components/layout/CustomerHeader.jsx";
import FeedbackPopup from "@components/feature/customer/FeedbackPopup.jsx";
import Swal from "sweetalert2";
import { formatDateTime, formatDate } from "../../utils/dateUtils";


function formatVND(amount) {
    if (amount == null) return "0 ₫";
    return Number(amount).toLocaleString("vi-VN") + " ₫";
}

const StatusBadge = ({ status }) => {
    const statusConfig = {
        PENDING_PAYMENT: { label: "Pending", className: "c-status-pending" },
        PENDING: { label: "Pending", className: "c-status-pending" },
        CONFIRMED: { label: "Confirmed", className: "c-status-confirmed" },
        "CHECKED-IN": { label: "Checked-in", className: "c-status-checked-in" },
        "CHECKED-OUT": { label: "Checked-out", className: "c-status-checked-out" },
        CANCELLED: { label: "Cancelled", className: "c-status-cancelled" },
        NO_SHOW: { label: "No show", className: "c-status-no-show" },
    };

    const config =
        statusConfig[status.toUpperCase()] || { label: status, className: "c-status-default" };

    return <span className={`c-status-badge ${config.className}`}>{config.label}</span>;
};

const BookingCard = ({ booking, onCancel, onContinuePayment, onFeedbackClick, bookingFeedbackMap }) => {
    const navigate = useNavigate();
    const [hasFeedback, setHasFeedback] = useState(
        bookingFeedbackMap?.[booking.bookingId] ?? false // ✅ Từ local map
    );

    const normalizedStatus = booking.status?.toUpperCase();

    const canCancel =
        normalizedStatus === "PENDING" ||
        normalizedStatus === "PENDING_PAYMENT" ||
        normalizedStatus === "CONFIRMED";

    const isCheckedIn = normalizedStatus === "CHECKED-IN";
    const isConfirmed = normalizedStatus === "CONFIRMED";
    const isPending = normalizedStatus === "PENDING" || normalizedStatus === "PENDING_PAYMENT";
    const isCancelled = normalizedStatus === "CANCELLED";
    const isCheckedOut = normalizedStatus === "CHECKED-OUT";
    
    // Check if feedback exists for this booking
    useEffect(() => {
        if (!isCheckedOut) return;

        const token = localStorage.getItem("token");

        fetch(`http://localhost:8080/api/feedbacks/booking/${booking.bookingId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) {
                    setHasFeedback(false);
                    return;
                }
                return res.json();
            })
            .then((data) => {
                if (data && data.feedbackId) {
                    setHasFeedback(true);
                } else {
                    setHasFeedback(false);
                }
            })
            .catch(() => {
                setHasFeedback(false);
            });
    }, [isCheckedOut, booking.bookingId]);

    //  Theo dõi thay đổi từ bookingFeedbackMap
    useEffect(() => {
        if (bookingFeedbackMap?.[booking.bookingId] !== undefined) {
            setHasFeedback(bookingFeedbackMap[booking.bookingId]);
        }
    }, [bookingFeedbackMap, booking.bookingId]);

    const handleCancelClick = async () => {
        const result = await Swal.fire({
            title: `Cancel booking #${booking.bookingId}?`,
            text: "This action cannot be undone.!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirm",
            cancelButtonText: "No",
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            await onCancel(booking.bookingId);
            Swal.fire({
                icon: "success",
                title: "Cancelled booking",
                timer: 1500,
                showConfirmButton: false,
            });
        }
    };

    const handleViewDetail = () => {
        navigate(`/booking-detail/${booking.bookingId}`);
    };

    const handleFeedbackClick = () => {
        onFeedbackClick(booking.bookingId, hasFeedback);
    };

    return (
        <div className="c-booking-card">
            <div className="c-booking-card-header">
                <div className="c-booking-id-section">
                    <h3>Booking #{booking.bookingId}</h3>
                    <StatusBadge status={booking.status} />
                </div>
                <div className="c-booking-created">
                    <span className="c-label">Time submit:</span>
                    <span className="c-value">{formatDateTime(booking.createAt)}</span>
                </div>
            </div>

            <div className="c-booking-card-body">
                <div className="c-booking-info-grid">
                    <div className="c-info-section">
                        <h4 className="c-section-title">
                            <i className="bx bx-calendar"></i> Time
                        </h4>
                        <div className="c-info-row">
                            <span className="c-info-label">Check-in:</span>
                            <span className="c-info-value">{formatDate(booking.checkinDate)}</span>
                        </div>
                        <div className="c-info-row">
                            <span className="c-info-label">Check-out:</span>
                            <span className="c-info-value">{formatDate(booking.checkoutDate)}</span>
                        </div>
                    </div>

                    <div className="c-info-section">
                        <h4 className="c-section-title">
                            <i className="bx bx-user"></i> Information contact
                        </h4>
                        <div className="c-info-row">
                            <span className="c-info-label">Name:</span>
                            <span className="c-info-value">{booking.contactName}</span>
                        </div>
                        <div className="c-info-row">
                            <span className="c-info-label">Phone number:</span>
                            <span className="c-info-value">{booking.contactPhone}</span>
                        </div>
                        <div className="c-info-row">
                            <span className="c-info-label">Email:</span>
                            <span className="c-info-value">{booking.contactEmail}</span>
                        </div>
                    </div>

                    <div className="c-info-section c-price-section">
                        <h4 className="c-section-title">
                            <i className="bx bx-money"></i> Total payment
                        </h4>
                        <div className="c-info-row">
                            <span className="c-info-label">All:</span>
                            <span className="c-info-value c-price-highlight">
                                {formatVND(booking.totalPrice)}
                            </span>
                        </div>
                        <div className="c-info-row">
                            <span className="c-info-label">Deposit (30%):</span>
                            <span className="c-info-value">{formatVND(booking.deposit)}</span>
                        </div>
                        {isCheckedOut && (
                            <div className="c-info-row">
                                <span className="c-info-label">Paid:</span>
                                <span className="c-info-value c-success-text">
                                    <i className="bx bx-check-circle"></i> Complete
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="c-booking-card-footer">
                {canCancel && (
                    <button className="c-btn-cancel" onClick={handleCancelClick}>
                        <i className="bx bx-x-circle"></i> Cancel Booking
                    </button>
                )}

                {isPending && (
                    <button
                        className="c-btn-primary"
                        onClick={() => onContinuePayment(booking.bookingId)}
                    >
                        <i className="bx bx-credit-card"></i> Continue Payment
                    </button>
                )}

                {isCheckedIn && (
                    <>
                        <button className="c-btn-view-detail" onClick={handleViewDetail}>
                            <i className="bx bx-file"></i> View Detail
                        </button>
                        <p className="c-info-text">
                            <i className="bx bx-check-shield"></i>
                        </p>
                    </>
                )}
                {isConfirmed && (
                    <>
                        <button className="c-btn-view-detail" onClick={handleViewDetail}>
                            <i className="bx bx-file"></i> View Detail
                        </button>
                        <p className="c-info-text">
                            <i className="bx bx-check-shield"></i>
                        </p>
                    </>
                )}
                {isCheckedOut && (
                    <>
                        <button className="c-btn-view-detail" onClick={handleViewDetail}>
                            <i className="bx bx-file"></i> View Detail
                        </button>
                        <p className="c-info-text">
                            <i className="bx bx-check-shield"></i>
                        </p>
                    </>
                )}
                {isCheckedOut && (
                    <button
                        className={hasFeedback ? "c-btn-view-feedback" : "c-btn-feedback"}
                        onClick={handleFeedbackClick}
                    >
                        <i className={hasFeedback ? "bx bx-show" : "bx bx-message-square-edit"}></i>
                        {hasFeedback ? " View Feedback" : " Feedback"}
                    </button>
                )}

                {isCancelled && (
                    <p className="c-cancelled-text">
                        <i className="bx bx-block"></i> Booking has been cancelled
                    </p>
                )}
            </div>
        </div>
    );
};

export default function MyBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [customerId, setCustomerId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("ALL");
    
    // ✅ Thêm bookingFeedbackMap state
    const [bookingFeedbackMap, setBookingFeedbackMap] = useState({});

    // Feedback popup state
    const [feedbackPopupOpen, setFeedbackPopupOpen] = useState(false);
    const [currentBookingId, setCurrentBookingId] = useState(null);
    const [existingFeedback, setExistingFeedback] = useState(null);

    const handleContinuePayment = (bookingId) => {
        navigate(`/book-room?bid=${bookingId}`);
    };

    const handleFeedbackClick = async (bookingId, hasFeedback) => {
        setCurrentBookingId(bookingId);

        if (hasFeedback) {
            // Fetch existing feedback
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`http://localhost:8080/api/feedbacks/booking/${bookingId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (!res.ok) {
                    console.error("Failed to fetch feedback:", res.status);
                    setExistingFeedback(null);
                    setFeedbackPopupOpen(true);
                    return;
                }
                
                const data = await res.json();
                setExistingFeedback(data);
            } catch (err) {
                console.error("Error fetching feedback:", err);
                setExistingFeedback(null);
            }
        } else {
            setExistingFeedback(null);
        }

        setFeedbackPopupOpen(true);
    };

    //  CẬP NHẬT handleFeedbackSuccess - Xử lý cả create/edit và delete
    const handleFeedbackSuccess = async () => {
        const token = localStorage.getItem("token");
        
        try {
            // Kiểm tra feedback còn tồn tại không
            const res = await fetch(`http://localhost:8080/api/feedbacks/booking/${currentBookingId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                if (data && data.feedbackId) {
                    //  Nếu có feedback → set true (create/edit)
                    setBookingFeedbackMap((prev) => ({
                        ...prev,
                        [currentBookingId]: true,
                    }));
                } else {
                    //  Nếu không có → set false (delete)
                    setBookingFeedbackMap((prev) => ({
                        ...prev,
                        [currentBookingId]: false,
                    }));
                }
            } else {
                //  Nếu 404 → feedback đã bị xóa
                setBookingFeedbackMap((prev) => ({
                    ...prev,
                    [currentBookingId]: false,
                }));
            }
        } catch (err) {
            console.error("Error updating feedback status:", err);
            //  Nếu error khi fetch → giả sử feedback bị xóa
            setBookingFeedbackMap((prev) => ({
                ...prev,
                [currentBookingId]: false,
            }));
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                icon: "warning",
                title: "You are not logged inp",
                text: "Please login to view booking!",
                confirmButtonText: "Log in"
            }).then(() => navigate("/login"));
            return;
        }

        fetch("http://localhost:8080/api/auth/me", {
            credentials: "include",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((r) => {
                if (!r.ok) throw new Error("Unable to authenticate");
                return r.json();
            })
            .then((data) => {
                const id = data.customerId || data.id || data.userId;
                if (id) {
                    setCustomerId(id);
                } else {
                    throw new Error("Customer ID not found");
                }
            })
            .catch((err) => {
                console.error(err);
                Swal.fire({
                    icon: "error",
                    title: "Authentication error",
                    text: "Your session has expired. Please log in again..",
                }).then(() => navigate("/login"));
            });
    }, [navigate]);

    useEffect(() => {
        if (!customerId) return;
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        fetch(`http://localhost:8080/api/bookings/my-bookings`, {
            credentials: "include",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Unable to load booking list");
                return res.json();
            })
            .then((data) => {
                const sorted = (data || []).sort(
                    (a, b) => new Date(b.createAt) - new Date(a.createAt)
                );
                setBookings(sorted);
            })
            .catch((err) => {
                console.error(err);
                setError("Unable to load booking list. Please try again later.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [customerId]);

    const handleCancelBooking = async (bookingId) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(
                `http://localhost:8080/api/bookings/my-bookings/cancel/${bookingId}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Can not cancel booking");
            }

            setBookings((prev) =>
                prev.map((b) =>
                    b.bookingId === bookingId ? { ...b, status: "CANCELLED" } : b
                )
            );
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Hủy thất bại",
                text: err.message,
            });
        }
    };

    // Filter logic: ALL excludes CHECKED-OUT, HISTORY shows only CHECKED-OUT
    const getFilteredBookings = () => {
        if (filterStatus === "ALL") {
            return bookings.filter(b => b.status?.toUpperCase() !== "CHECKED-OUT");
        } else if (filterStatus === "HISTORY") {
            return bookings.filter(b => b.status?.toUpperCase() === "CHECKED-OUT");
        } else {
            const status = bookings.filter((b) => {
                const s = b.status?.toUpperCase();
                return s === filterStatus || (filterStatus === "PENDING" && s === "PENDING_PAYMENT");
            });
            return status;
        }
    };

    const filteredBookings = getFilteredBookings();

    // Count for each status
    const getStatusCount = (status) => {
        if (status === "ALL") {
            return bookings.filter(b => b.status?.toUpperCase() !== "CHECKED-OUT").length;
        } else if (status === "HISTORY") {
            return bookings.filter(b => b.status?.toUpperCase() === "CHECKED-OUT").length;
        } else {
            return bookings.filter((b) => {
                const s = b.status?.toUpperCase();
                return s === status || (status === "PENDING" && s === "PENDING_PAYMENT");
            }).length;
        }
    };

    if (loading) {
        return (
            <div>
                <CustomerHeader />
                <div className="c-my-bookings-container">
                    <div className="c-loading-spinner">
                        <i className="bx bx-loader-alt bx-spin"></i> Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <CustomerHeader />
            <div className="c-my-bookings-container">
                <div className="c-my-bookings-header">
                    <h1><i className="bx bx-book"></i> My Bookings</h1>
                </div>

                {error && <div className="c-error-message">{error}</div>}

                <div className="c-filter-buttons">
                    {[
                        "ALL",
                        "PENDING",
                        "CONFIRMED",
                        "CHECKED-IN",
                        "HISTORY",
                        "CANCELLED",
                    ].map((status) => (
                        <button
                            key={status}
                            className={`c-filter-btn ${filterStatus === status ? "c-active" : ""}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === "HISTORY" ? `History Booking (${getStatusCount(status)})` :
                                status === "ALL" ? `All Bookings (${getStatusCount(status)})` :
                                    `${status.replace("_", " ")} (${getStatusCount(status)})`}
                        </button>
                    ))}
                </div>

                <div className="c-bookings-list">
                    {filteredBookings.length === 0 ? (
                        <div className="c-empty-state">
                            <div className="c-empty-icon">
                                <i className="bx bx-list-ul"></i>
                            </div>
                            <h3>No bookings</h3>
                            <p>
                                {filterStatus === "ALL"
                                    ? "You do not have any booking. Book now!"
                                    : filterStatus === "HISTORY"
                                        ? "You have no completed bookings yet."
                                        : `There are no bookings in "${filterStatus}"`}
                            </p>
                            {filterStatus === "ALL" && (
                                <button
                                    className="c-btn-primary"
                                    onClick={() => navigate("/search")}
                                >
                                    <i className="bx bx-hotel"></i> Book now
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <BookingCard
                                key={booking.bookingId}
                                booking={booking}
                                onCancel={handleCancelBooking}
                                onContinuePayment={handleContinuePayment}
                                onFeedbackClick={handleFeedbackClick}
                                bookingFeedbackMap={bookingFeedbackMap} //  Truyền props này
                            />
                        ))
                    )}
                </div>
            </div>

            <footer className="c-my-bookings-footer">
                <div>
                    <h3><i className="bx bx-support"></i> You need support?</h3>
                    <p>Contact: +84 (0)951 127 855</p>
                    <p>Email: support@oasishotel.com</p>
                </div>
            </footer>

            {/* Feedback Popup */}
            <FeedbackPopup
                isOpen={feedbackPopupOpen}
                onClose={() => setFeedbackPopupOpen(false)}
                bookingId={currentBookingId}
                existingFeedback={existingFeedback}
                onSuccess={handleFeedbackSuccess}
            />
        </div>
    );
}