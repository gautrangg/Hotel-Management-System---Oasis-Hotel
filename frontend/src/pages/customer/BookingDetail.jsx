import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "@assets/booking/BookingDetail.css";
import CustomerHeader from "@components/layout/CustomerHeader.jsx";
import ViewInvoice from "@components/feature/invoice/ViewInvoice.jsx";
import Swal from "sweetalert2";
import { formatDateTime } from "../../utils/dateUtils";

function formatVND(amount) {
    if (amount == null) return "0 ₫";
    return Number(amount).toLocaleString("vi-VN") + " ₫";
}

export default function BookingDetail() {
    const [showInvoice, setShowInvoice] = useState(false);
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingRequestId, setDeletingRequestId] = useState(null);

    const handleViewInvoice = async () => {
        setShowInvoice(true);  
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Authentication Required',
                text: 'You need to login!',
            }).then(() => {
                navigate("/login");
            });
            return;
        }

        fetch(`http://localhost:8080/api/bookings/${bookingId}/detail`, {
            credentials: "include",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) {
                    return res.text().then(text => {
                        throw new Error(text || "Cannot load booking detail");
                    });
                }
                return res.json();
            })
            .then((data) => {
                setBookingData(data);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [bookingId, navigate]);

    const handleDeleteServiceRequest = async (requestId, status) => {
        if (status?.toUpperCase() !== "PENDING") {
            Swal.fire({
                icon: 'warning',
                title: 'Action Not Allowed',
                text: 'Only PENDING service requests can be deleted!',
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to delete this service request?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            setDeletingRequestId(requestId);
            const token = localStorage.getItem("token");

            try {
                const res = await fetch(
                    `http://localhost:8080/api/bookings/${bookingId}/service-requests/${requestId}`,
                    {
                        method: "DELETE",
                        credentials: "include",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText);
                }

                await Swal.fire(
                    'Deleted!',
                    'Service request has been deleted.',
                    'success'
                );
                window.location.reload();

            } catch (err) {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Deletion Failed',
                    text: err.message,
                });
            } finally {
                setDeletingRequestId(null);
            }
        }
    };

    if (loading) {
        return (
            <div>
                <CustomerHeader />
                <div className="bd-container">
                    <div className="bd-loading">Loading booking detail...</div>
                </div>
            </div>
        );
    }

    if (error || !bookingData) {
        return (
            <div>
                <CustomerHeader />
                <div className="bd-container">
                    <div className="bd-error">{error || "Booking not found"}</div>
                    <button className="bd-btn-back" onClick={() => navigate("/my-bookings")}>
                        ← Back to My Bookings
                    </button>
                </div>
            </div>
        );
    }

    const { room, services } = bookingData;

    return (
        <div>
            <CustomerHeader />
            <div className="bd-container">
                <div className="bd-header">
                    <button className="bd-btn-back" onClick={() => navigate("/my-bookings")}>
                        ← Back
                    </button>
                    <h1>Booking Detail #{bookingData.bookingId}</h1>
                </div>

                <div className="bd-content-wrapper">
                    <div className="bd-left-section">
                        <div className="bd-room-card">
                            <div className="bd-room-image">
                                <img src={room.imageUrl} alt={room.roomTypeName} />
                            </div>
                            <div className="bd-room-info">
                                <h2>{room.roomTypeName}</h2>
                                <p className="bd-room-number">Room {room.roomNumber}</p>
                                <p className="bd-room-price">{formatVND(room.pricePerNight)}</p>
                                <div className="bd-room-description">
                                    <h3>Room Description</h3>
                                    <p>{room.description || "No description available"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bd-services-section">
                            <h2>Service Request</h2>
                            {services && services.length > 0 ? (
                                <div className="bd-services-list">
                                    {services.map((service) => (
                                        <div key={service.requestId} className="bd-service-card">
                                            <img
                                                src={service.imageUrl}
                                                alt={service.serviceName}
                                                className="bd-service-image"
                                            />
                                            <div className="bd-service-info">
                                                <h3>{service.serviceName}</h3>
                                                <div className="bd-service-details">
                                                    <span className="bd-service-quantity">
                                                        Quantity: {service.quantity}
                                                    </span>
                                                    <span className="bd-service-unit-price">
                                                        Unit price: {formatVND(service.unitPrice)}
                                                    </span>
                                                </div>
                                                {service.note && (
                                                    <div className="bd-service-note">
                                                        <span className="bd-note-label">Note:</span>
                                                        <span className="bd-note-text">{service.note}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bd-service-right">
                                                <div className={`bd-service-status bd-status-${service.status?.toLowerCase()}`}>
                                                    {service.status || "Pending"}
                                                </div>
                                                <p className="bd-service-total">
                                                    {formatVND(service.totalPrice)}
                                                </p>
                                            </div>

                                            {service.status?.toUpperCase() === "PENDING" && (
                                                <button
                                                    className="bd-service-delete-btn"
                                                    onClick={() => handleDeleteServiceRequest(service.requestId, service.status)}
                                                    disabled={deletingRequestId === service.requestId}
                                                    title="Delete service request"
                                                >
                                                    {deletingRequestId === service.requestId ? "..." : "✕"}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="bd-no-services">No service required.</p>
                            )}
                        </div>
                    </div>

                    <div className="bd-right-section">
                        <div
                            id="invoice-section"
                            className="bd-invoice-placeholder"
                            onClick={handleViewInvoice}
                            style={{ cursor: "pointer" }}
                        >
                            <h2>Invoice</h2>

                            {bookingData?.invoiceData ? (
                                <div className="bd-invoice-summary">
                                    <p><strong>Customer:</strong> {bookingData.customer?.name}</p>
                                    <p><strong>Room Type:</strong> {bookingData.room?.roomTypeName} (#{bookingData.room?.roomNumber})</p>
                                    <p><strong>Check-in:</strong> {formatDateTime(bookingData.checkinDate)}</p>
                                    <p><strong>Check-out:</strong> {formatDateTime(bookingData.checkoutDate)}</p>
                                    <p><strong>Deposit:</strong> {formatVND(bookingData.invoiceData.deposit)}</p>
                                    <hr />
                                    <p className="bd-invoice-click-note">Click to view detail invoice</p>
                                </div>
                            ) : (
                                <div className="bd-invoice-notice">
                                    <p><strong>Click to view detail invoice</strong></p>
                                    <p>No data for this invoice</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showInvoice && (
                <ViewInvoice
                    bookingId={bookingId}          
                    onClose={() => setShowInvoice(false)} 
                />
            )}
        </div>
    );
}
