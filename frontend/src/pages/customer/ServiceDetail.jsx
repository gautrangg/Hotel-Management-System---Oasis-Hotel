import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from "sweetalert2";

import '@assets/service/ServiceDetail1.css';
import CustomerHeader from "@components/layout/CustomerHeader";
import Footer from "@components/layout/Footer";

import { scroll } from '@utils/scroll';

const API_BASE_URL = 'http://localhost:8080/api';

const ServiceDetail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const serviceId = searchParams.get('id');


    const [service, setService] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [suggestedServices, setSuggestedServices] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const [quantity, setQuantity] = useState(1);

    const [activeRooms, setActiveRooms] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [notes, setNotes] = useState('');
    const [expectedTime, setExpectedTime] = useState('');

    const scrollContainerRef = useRef(null);
    const { scrollLeft, scrollRight } = scroll(scrollContainerRef);

    const handleQuantityChange = (amount) => {
        setQuantity(prevQuantity => Math.max(1, prevQuantity + amount));
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);

            if (!serviceId) {
                setError("Service ID is missing.");
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication error: Please log in.");
                setLoading(false);
                return;
            }
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const [serviceResponse, roomsResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/services/${serviceId}`, { headers }),
                    axios.get(`${API_BASE_URL}/bookings/my-bookings/active/rooms`, { headers })
                ]);

                const currentActiveRooms = roomsResponse.data;
                setActiveRooms(currentActiveRooms);
                if (currentActiveRooms.length > 0) {
                    setSelectedBookingId(currentActiveRooms[0].bookingId);
                    setSelectedBooking(currentActiveRooms[0]);
                }

                const currentService = serviceResponse.data;
                setService(currentService);

                if (currentService.categoryId) {
                    const [categoryResponse, allServicesResponse] = await Promise.all([
                        axios.get(`${API_BASE_URL}/service-categories/${currentService.categoryId}`, { headers }),
                        axios.get(`${API_BASE_URL}/services`, { headers })
                    ]);

                    setCategoryName(categoryResponse.data.categoryName);
                    const filteredServices = allServicesResponse.data.filter(
                        (s) => s.categoryId === currentService.categoryId && s.serviceId !== currentService.serviceId
                    );
                    setSuggestedServices(filteredServices);
                }
            } catch (err) {
                setError('Failed to fetch page details.');
                console.error("API Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [serviceId]);

    const handleRoomChange = (event) => {
        const newBookingId = event.target.value;
        setSelectedBookingId(newBookingId);

        const newSelectedBooking = activeRooms.find(
            (room) => room.bookingId.toString() === newBookingId
        );
        setSelectedBooking(newSelectedBooking);
    };

    const validateExpectedTime = (timeToValidate) => {
        if (!timeToValidate) {
            return true;
        }

        const now = new Date();
        const expected = new Date(timeToValidate);

        if (isNaN(expected.getTime())) {
            return "The selected time format is invalid.";
        }

        if (expected <= now) {
            return "Please select a time in the future.";
        }

        if (selectedBooking && selectedBooking.checkinDate && selectedBooking.checkoutDate) {
            const checkInTime = new Date(selectedBooking.checkinDate);
            const checkOutTime = new Date(selectedBooking.checkoutDate);

            const checkoutDeadline = new Date(checkOutTime);
            checkoutDeadline.setHours(10, 0, 0, 0);

            if (expected < checkInTime) {
                return `Your stay starts at ${checkInTime.toLocaleString()}. Please select a time after check-in.`;
            }

            if (expected > checkoutDeadline) {
                return `Service must be requested before 10:00 AM on your checkout date (${checkoutDeadline.toLocaleDateString()}).`;
            }
        }

        if (service.availableStartTime && service.availableEndTime) {
            const serviceStartToday = new Date(expected);
            const [startHour, startMinute] = service.availableStartTime.split(':');
            serviceStartToday.setHours(startHour, startMinute, 0, 0);

            const serviceEndToday = new Date(expected);
            const [endHour, endMinute] = service.availableEndTime.split(':');
            serviceEndToday.setHours(endHour, endMinute, 0, 0);

            if (expected < serviceStartToday || expected > serviceEndToday) {
                return `This service is only available between ${formatTime(service.availableStartTime)} and ${formatTime(service.availableEndTime)}.`;
            }
        }

        return true;
    };

    const handleRequestSubmit = async (event) => {
        event.preventDefault();

        const validationResult = validateExpectedTime(expectedTime);
        if (typeof validationResult === 'string') {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Time',
                text: validationResult,
            });
            return;
        }

        if (!selectedBookingId) {
            Swal.fire("Info", "You don't have a booking to request.", "info");
            return;
        }

        const result = await Swal.fire({
            title: "Confirm request?",
            text: `Request ${quantity} × ${service.serviceName} to room`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, request!",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            confirmButtonColor: "#f97316",
        });

        if (!result.isConfirmed) return;

        const formData = new FormData();
        formData.append('serviceId', serviceId);
        formData.append('bookingId', selectedBookingId);
        formData.append('quantity', quantity);
        formData.append('note', notes);

        if (expectedTime) {
            formData.append('expectedTime', expectedTime);
        }

        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire("Error", "Authentication error. Please log in again.", "error");
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/service-requests/create-request`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            Swal.fire("Success", "Service requested successfully!", "success");
            console.log('Server Response:', response.data);

        } catch (err) {
            Swal.fire("Error", "Failed to request service. Please try again.", "error");
            console.error("Error submitting service request:", err);
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatTime = (timeString) => {
        if (!timeString || typeof timeString !== 'string') return '';
        return timeString.substring(0, 5);
    };

    if (loading) {
        return (
            <>
                <CustomerHeader />
                <div className="c-loading-spinner">
                    <i className="bx bx-loader-alt bx-spin"></i> Loading...
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <CustomerHeader />
                <div className="c-loading-spinner">
                    <div className="text-center mt-20 text-red-600">Error: {error}</div>
                </div>
            </>
        );
    }
    if (!service) {
        return (
            <>
                <CustomerHeader />
                <div className="c-loading-spinner">
                    <div className="text-center mt-20">Not found.</div>
                </div>
            </>
        );
    }

    return (
        <>
            <CustomerHeader />
            <div className="t-servicedetail-page">
                <h1 className="t-servicedetail-header">{service.serviceName}</h1>
                <nav className="t-servicedetail-breadcrumbs">
                    <span
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/home")}
                    >
                        Home
                    </span>
                    &rsaquo;{" "}
                    <span
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/services")}
                    >
                        Service
                    </span>
                    &rsaquo; <span>{service.serviceName}</span>
                </nav>

                <main className="t-servicedetail-main-content">
                    <div className="t-servicedetail-left-column">
                        <img
                            src={`http://localhost:8080/upload/service/${service.image}`}
                            alt="Breakfast"
                            className="t-servicedetail-image"
                        />
                        <span className="t-servicedetail-time-value">{categoryName}</span>
                        <p className="t-servicedetail-description">
                            {service.description || 'No description available.'}
                        </p>
                        {service.availableStartTime && service.availableEndTime && (
                            <div className="t-servicedetail-time">
                                Available Time:
                                <span className="t-servicedetail-time-value">
                                    {formatTime(service.availableStartTime)} - {formatTime(service.availableEndTime)}
                                </span>
                            </div>
                        )}

                    </div>

                    <div className="t-servicedetail-right-column">
                        <div className="t-servicedetail-request-box">
                            <div className="t-servicedetail-price-section">
                                <span className="t-servicedetail-price-label">PRICE PER {service.unit?.toUpperCase() || 'UNIT'}</span>
                                <span className="t-servicedetail-price-value">{formatCurrency(service.pricePerUnit)}</span>
                            </div>

                            <div className="t-servicedetail-form-header">
                                <p className="t-servicedetail-form-subtitle">ENJOY WHILE STAYING IN OASIS HOTEL</p>
                                <h2 className="t-servicedetail-form-title">Request this service</h2>
                            </div>

                            <form className="t-servicedetail-form" onSubmit={handleRequestSubmit}>
                                <div className="t-servicedetail-form-group">
                                    <label htmlFor="room">Room</label>
                                    <select
                                        id="room"
                                        className="t-servicedetail-input"
                                        value={selectedBookingId}
                                        onChange={handleRoomChange}
                                        disabled={activeRooms.length === 0}
                                    >
                                        {activeRooms.length > 0 ? (
                                            activeRooms.map(room => (
                                                <option key={room.roomId} value={room.bookingId}>
                                                    {room.roomNumber}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">You have no checked-in rooms</option>
                                        )}
                                    </select>
                                </div>

                                <div className="t-servicedetail-form-group">
                                    <label htmlFor="expectedTime">Expected Time:</label>
                                    <input type='datetime-local'
                                        id="expectedTime"
                                        className="t-servicedetail-input"
                                        value={expectedTime}
                                        onChange={(e) => setExpectedTime(e.target.value)}
                                    />
                                </div>

                                <div className="t-servicedetail-form-group">
                                    <label htmlFor="quantity">Quantity</label>
                                    <div id="quantity" className="t-servicedetail-input t-servicedetail-quantity-control">
                                        <span>{quantity}</span>
                                        <div className="t-servicedetail-quantity-buttons">
                                            <button type="button" onClick={() => handleQuantityChange(1)}>+</button>
                                            <button type="button" onClick={() => handleQuantityChange(-1)}>−</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="t-servicedetail-form-group">
                                    <label htmlFor="notes">Notes</label>
                                    <textarea
                                        id="notes"
                                        className="t-servicedetail-input"
                                        placeholder="Any special requests?"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    ></textarea>
                                </div>

                                <button type="submit" className="t-servicedetail-submit-btn">Request</button>
                            </form>
                        </div>
                    </div>
                </main>

                {suggestedServices.length > 0 && (
                    <section className="t-servicedetail-suggest-section">
                        <h2 className="t-servicedetail-suggest-header">
                            Suggest for you from {categoryName}
                        </h2>

                        <div className="t-servicedetail-suggest-list-wrapper" ref={scrollContainerRef}>
                            <div className="t-servicedetail-suggest-list">
                                {suggestedServices.map(s => (
                                    <article key={s.serviceId} className="t-servicedetail-suggest-card">
                                        <img
                                            src={s.image ? `http://localhost:8080/upload/service/${s.image}` : 'https://placehold.co/600x400?text=No+Image'}
                                            alt={s.serviceName}
                                            className="t-servicedetail-suggest-card-image"
                                        />
                                        <div className="t-servicedetail-suggest-card-body">
                                            <div className="t-servicedetail-suggest-card-info">
                                                <h3 className="t-servicedetail-suggest-card-title">{s.serviceName}</h3>
                                                <p className="t-servicedetail-suggest-card-price">{formatCurrency(s.pricePerUnit)}</p>
                                            </div>
                                            <Link to={`/service-detail?id=${s.serviceId}`} className="t-servicedetail-suggest-card-button">
                                                View
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="t-servicedetail-suggest-nav">
                            <button className="t-servicedetail-suggest-nav-btn" onClick={scrollLeft} aria-label="Previous slide">
                                <i className='bx bx-chevron-left' style={{ color: '#fff', fontSize: '24px' }}></i>
                            </button>
                            <button className="t-servicedetail-suggest-nav-btn" onClick={scrollRight} aria-label="Next slide">
                                <i className='bx bx-chevron-right' style={{ color: '#fff', fontSize: '24px' }}></i>
                            </button>
                        </div>
                    </section>
                )}
            </div >
            <Footer />
        </>
    );
};

export default ServiceDetail;