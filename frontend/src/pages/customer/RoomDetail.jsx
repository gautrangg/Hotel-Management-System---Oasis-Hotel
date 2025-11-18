import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "@assets/roomtype/RoomDetail.css";
import CustomerHeader from "@components/layout/CustomerHeader";
import Footer from "@components/layout/Footer";
import DateRangePicker from '@components/feature/price/DateRangePicker';
import Swal from 'sweetalert2';
import jwtDecode from "jwt-decode";

const CalendarIcon = ({ className = "h-5 w-5 text-gray-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const UserIcon = ({ className = "h-5 w-5 text-gray-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const AirConIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-orange-600" style={{ color: '#ea580c', width: '2rem', height: '2rem' }}><path d="M12 19a3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3ZM12 12a3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3ZM12 5a3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3ZM12 5a3 3 0 0 0-3-3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3 3ZM7 19h.01M17 19h.01M7 5h.01M17 5h.01" /></svg>
);

const TvIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-orange-600" style={{ color: '#ea580c', width: '2rem', height: '2rem' }}><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
);

const WifiIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-orange-600" style={{ color: '#ea580c', width: '2rem', height: '2rem' }}><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
);

const PoolIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-orange-600" style={{ color: '#ea580c', width: '2rem', height: '2rem' }}><path d="M12 12a2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2zM18 12a2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2zM6 12a2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2zM2 18h20v2H2z" /><path d="M5 18v-2a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2" /></svg>
);

const AllInclusiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-orange-600" style={{ color: '#ea580c', width: '2rem', height: '2rem' }}><circle cx="12" cy="12" r="10"></circle><path d="m14.31 8-6.62 8M9.69 8h4.62M9.69 16h4.62"></path></svg>
);

const SpaIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-orange-600" style={{ color: '#ea580c', width: '2rem', height: '2rem' }}><path d="M7.5 4.5c1.1-1.1 2.9-1.1 4 0 .9.9 1.2 2.3 1 3.5-1.4.3-2.8.9-3.9 2-2.4 2.4-2.4 6.2 0 8.5 2.3 2.3 6.2 2.3 8.5 0" /><path d="M10.5 7.5c.3-1.4.9-2.8 2-3.9 2.4-2.4 6.2-2.4 8.5 0 2.3 2.3 2.3 6.2 0 8.5-1.1 1.1-2.5 1.7-3.9 2" /></svg>
);

const amenities = [
    { icon: <AirConIcon />, text: 'Air-conditioning' },
    { icon: <AllInclusiveIcon />, text: 'All Inclusive' },
    { icon: <WifiIcon />, text: 'Free WI-FI' },
    { icon: <PoolIcon />, text: 'Private Pools' },
    { icon: <TvIcon />, text: 'Smart TV' },
    { icon: <SpaIcon />, text: 'Spa and Massage' },
];

const token = localStorage.getItem('token');
const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

const ImageGallery = ({ roomTypeId }) => {
    const [images, setImages] = useState([]);
    const [currentImage, setCurrentImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!roomTypeId) {
            setIsLoading(false);
            return;
        }

        const fetchImages = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:8080/api/roomtypes/${roomTypeId}/images`);

                const imageUrls = response.data.map(name => `http://localhost:8080/upload/rooms/${name}`);
                setImages(imageUrls);

                if (imageUrls.length > 0) {
                    setCurrentImage(imageUrls[0]);
                } else {
                    setCurrentImage('/placeholder.jpg');
                }
            } catch (err) {
                console.error("Error load images:", err);
                setError("Cannot load.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, [roomTypeId]);

    if (isLoading) {
        return <div className="t-roomdetail-gallery-loading">Loading...</div>;
    }

    if (error) {
        return <div className="t-roomdetail-gallery-error">{error}</div>;
    }

    if (images.length === 0) {
        return (
            <div className="t-roomdetail-gallery">
                <img src={currentImage} alt="No images available" className="t-roomdetail-gallery-main-img" />
            </div>
        );
    }

    return (
        <div className="t-roomdetail-gallery">
            <img src={currentImage} alt="Room main view" className="t-roomdetail-gallery-main-img" />
            <div className="t-roomdetail-gallery-thumbnails">
                {images.map((img, index) => (
                    <div key={index} className="t-roomdetail-gallery-thumbnail-item">
                        <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className={`t-roomdetail-gallery-thumbnail-img ${currentImage === img ? 'active' : ''}`}
                            onClick={() => setCurrentImage(img)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const isDateRangeAvailable = (checkin, checkout, bookedDates) => {
    if (!checkin || !checkout) {
        return true;
    }

    const start = new Date(checkin);
    start.setHours(0, 0, 0, 0);

    const end = new Date(checkout);
    end.setHours(0, 0, 0, 0);

    for (const booking of bookedDates) {
        const bookingStart = new Date(booking.checkinDate);
        bookingStart.setHours(0, 0, 0, 0);

        const bookingEnd = new Date(booking.checkoutDate);
        bookingEnd.setHours(0, 0, 0, 0);

        if (start < bookingEnd && end > bookingStart) {
            return false;
        }
    }

    return true;
};


const BookingForm = ({
    roomType,
    roomsByFloor,
    selectedRoom,
    onRoomSelect,
    bookedDates,
    onRefreshSchedule,
    allRoomSchedules, // Lịch của tất cả các phòng
    checkinDate,     // Nhận state từ component cha
    checkoutDate,    // Nhận state từ component cha
    onDatesChange    // Hàm xử lý thay đổi ngày của component cha
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [adult, setAdult] = useState(1);
    const [children, setChildren] = useState(0);

    const [validationError, setValidationError] = useState('');

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setValidationError('');

        if (roomType && adult > roomType.adult) {
            setValidationError(`Number of guests cannot exceed room capacity of room.`);
            return;
        }
        if (roomType && children > roomType.children) {
            setValidationError(`Number of guests cannot exceed room capacity of room.`);
            return;
        }
        if (adult < 1) {
            setValidationError(`Number of guests must be at least 1.`);
            return;
        }

        if (checkinDate && checkoutDate) {
            const start = new Date(checkinDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(checkoutDate);
            end.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (start <= today) {
                setValidationError('Check-in date must be after today.');
                return;
            }

            if (end <= start) {
                setValidationError('Check-out date must be after check-in date.');
                return;
            }

            if (selectedRoom && !isDateRangeAvailable(checkinDate, checkoutDate, bookedDates)) {
                setValidationError('The selected dates are not available for this room.');
                return;
            }
        }
    }, [checkinDate, checkoutDate, adult, children, selectedRoom, bookedDates, roomType]);

    const handleDatesChange = ({ checkin, checkout }) => {
        onDatesChange({ checkin, checkout });
    };

    const handleSelectRoom = (room) => {
        onRoomSelect(room);
        setIsDropdownOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (validationError || !checkinDate || !checkoutDate || !selectedRoom) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Please fill in correctly all the field.',
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Confirm Booking Information?',
            icon: 'info',
            html: `
<div style="text-align: left; padding: 0 1rem;">
<p><strong>Selected Room:</strong> ${selectedRoom.number}</p>
<p><strong>Check in Date:</strong> ${checkinDate}</p>
<p><strong>Check out Date:</strong> ${checkoutDate}</p>
<p><strong>Number of Adults:</strong> ${adult}</p>
<p><strong>Number of Children:</strong> ${children}</p>
</div>
 `,
            showCancelButton: true,
            confirmButtonColor: '#df6500ff',
            cancelButtonColor: 'rgba(142, 142, 142, 1)',
            confirmButtonText: 'Yes, book!',
            cancelButtonText: 'Cancel'
        });
        if (result.isConfirmed) {
            try {
                const initiationData = {
                    roomId: selectedRoom.id,
                    checkinDate: `${checkinDate}T14:00:00`,
                    checkoutDate: `${checkoutDate}T12:00:00`,
                    adult: adult,
                    children: children
                };

                const token = localStorage.getItem('token');
                const decoded = jwtDecode(token);
                if (!token) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Login Required',
                        text: 'Please login to view and book.',
                    });
                    navigate('/login');
                    return;
                }


                const response = await axios.post(
                    "http://localhost:8080/api/bookings/initiate",
                    initiationData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { customerId: decoded.id },
                    }
                );

                const { bookingId } = response.data;


                if (bookingId) {
                    navigate(`/book-room?bid=${bookingId}`);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Cannot initialize booking, Please try again later.',
                    });
                }

            } catch (error) {
                console.error("Error initiation:", error);
                const errorMessage = error.response?.data?.message || "Error, Please try again later.";
                Swal.fire({
                    icon: 'error',
                    title: 'An Error occurred, Please try again later',
                    text: errorMessage,
                }).then(() => {
                    if (onRefreshSchedule && selectedRoom) {
                        onRefreshSchedule(selectedRoom);
                    }
                });
            }
        }
    };

    return (
        <div className="t-roomdetail-booking-card">
            <p className="t-roomdetail-booking-card-subtitle">START YOUR JOURNEY</p>
            <h3 className="t-roomdetail-booking-card-title">Reserve Your Room</h3>
            <form className="t-roomdetail-booking-form" onSubmit={handleSubmit}>

                <div className="t-roomdetail-form-group full-width">
                    <label htmlFor="checkin" className="t-roomdetail-form-label">Check-in</label>
                    <div className="t-roomdetail-input-wrapper">
                        <i className='bx bxs-calendar t-roomdetail-input-icon'></i>
                        <input
                            type="text"
                            id="checkin"
                            placeholder="Select Date"
                            className="t-roomdetail-form-input with-icon"
                            value={checkinDate}
                            readOnly
                            onClick={() => setIsCalendarOpen(true)}
                        />
                    </div>
                </div>

                <div className="t-roomdetail-form-group full-width">
                    <label htmlFor="checkout" className="t-roomdetail-form-label">Check-out</label>
                    <div className="t-roomdetail-input-wrapper">
                        <i className='bx bxs-calendar t-roomdetail-input-icon'></i>
                        <input
                            type="text"
                            id="checkout"
                            placeholder="Select Date"
                            className="t-roomdetail-form-input with-icon"
                            value={checkoutDate}
                            readOnly
                            onClick={() => setIsCalendarOpen(true)}
                        />
                    </div>
                </div>

                {/* Room Selector Dropdown */}
                <div className="t-roomdetail-form-group full-width">
                    <label htmlFor="room-select" className="t-roomdetail-form-label">Room</label>
                    <div className="t-roomdetail-custom-select-wrapper">
                        <div
                            className="t-roomdetail-custom-select-trigger"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span>{selectedRoom ? selectedRoom.number : 'Select a Room'}</span>
                            <i className='bx bx-chevron-down t-roomdetail-select-arrow'></i>
                        </div>
                        {isDropdownOpen && (
                            <div className="t-roomdetail-custom-select-options">
                                <div className="t-roomdetail-rooms-grid-in-form">
                                    {roomsByFloor.map((floor, floorIndex) => (
                                        <div key={floorIndex} className="t-roomdetail-rooms-row-in-form">
                                            {floor.map((room) => {
                                                // Lấy lịch của phòng này từ state tổng
                                                const roomSchedule = allRoomSchedules.get(room.id) || [];
                                                // Kiểm tra xem có sẵn trong ngày đã chọn không
                                                const isAvailable = isDateRangeAvailable(checkinDate, checkoutDate, roomSchedule);
                                                // Disable nếu ngày đã được chọn VÀ phòng không có sẵn
                                                const isDisabled = (checkinDate && checkoutDate && !isAvailable);

                                                return (
                                                    <div
                                                        key={room.id}
                                                        className={`t-roomdetail-room-item ${selectedRoom?.id === room.id ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                        onClick={() => !isDisabled && handleSelectRoom(room)}
                                                    >
                                                        {room.number}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ... (Các input Max Adults, Number of Adults, Max Children, Number of Children giữ nguyên) ... */}
                <div className="t-roomdetail-form-group half-width">
                    <label htmlFor="capacity" className="t-roomdetail-form-label">Max Adults</label>
                    <div className="t-roomdetail-input-wrapper">
                        <i className='bx bxs-user-check t-roomdetail-input-icon'></i>
                        <input
                            type="number"
                            id="capacity"
                            value={roomType?.adult || ''}
                            readOnly
                            className="t-roomdetail-form-input with-icon readonly"
                        />
                    </div>
                </div>

                {/* Guests Input */}
                <div className="t-roomdetail-form-group half-width">
                    <label htmlFor="guests" className="t-roomdetail-form-label">Number of Adults</label>
                    <div className="t-roomdetail-input-wrapper">
                        <i className='bx bxs-user-circle t-roomdetail-input-icon'></i>
                        <input
                            type="number"
                            id="guests"
                            min="1"
                            value={adult}
                            onChange={(e) => setAdult(parseInt(e.target.value, 10))}
                            placeholder="Number of Guests"
                            className="t-roomdetail-form-input with-icon"
                        />
                    </div>
                </div>

                <div className="t-roomdetail-form-group half-width">
                    <label htmlFor="capacity" className="t-roomdetail-form-label">Max Children</label>
                    <div className="t-roomdetail-input-wrapper">
                        <i className='bx bxs-user-check t-roomdetail-input-icon'></i>
                        <input
                            type="number"
                            id="capacity"
                            value={roomType?.children || ''}
                            readOnly
                            className="t-roomdetail-form-input with-icon readonly"
                        />
                    </div>
                </div>

                {/* Guests Input */}
                <div className="t-roomdetail-form-group half-width">
                    <label htmlFor="guests" className="t-roomdetail-form-label">Number of Children</label>
                    <div className="t-roomdetail-input-wrapper">
                        <i className='bx bxs-user-circle t-roomdetail-input-icon'></i>
                        <input
                            type="number"
                            id="guests"
                            min="0"
                            value={children}
                            onChange={(e) => setChildren(parseInt(e.target.value, 10))}
                            placeholder="Number of Guests"
                            className="t-roomdetail-form-input with-icon"
                        />
                    </div>
                </div>

                {validationError && <p className="t-roomdetail-validation-error full-width">{validationError}</p>}

                <div className="full-width">
                    <button
                        type="submit"
                        className="t-roomdetail-form-button"
                        disabled={!!validationError || !checkinDate || !checkoutDate || !selectedRoom} // --- MODIFIED --- Thêm !selectedRoom
                    >
                        BOOK
                    </button>
                </div>
            </form>

            {isCalendarOpen && (
                <DateRangePicker
                    onClose={() => setIsCalendarOpen(false)}
                    onDatesChange={handleDatesChange} // Vẫn dùng hàm local, hàm này sẽ gọi prop
                    basePrice={roomType?.price}
                    bookedDates={bookedDates} // Vẫn hiển thị lịch của phòng ĐÃ CHỌN
                />
            )}
        </div>
    );
};

const AvailabilityCalendar = ({ bookedDates = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1));
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const isDateBooked = (date, bookings) => {
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        return bookings.some(booking => {
            const checkin = new Date(booking.checkinDate);
            const checkout = new Date(booking.checkoutDate);
            checkin.setHours(0, 0, 0, 0);
            checkout.setHours(0, 0, 0, 0);
            return checkDate >= checkin && checkDate < checkout;
        });
    };

    const renderCalendar = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="t-roomdetail-calendar-day"></div>);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            let classes = "t-roomdetail-calendar-day";

            if (isDateBooked(dayDate, bookedDates)) {
                classes += " booked";
            } else {
                classes += " available";
            }

            days.push(<div key={i} className={classes}>{i}</div>);
        }
        return days;
    };

    const nextMonthDate = new Date(currentDate);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <div className="t-roomdetail-calendar-container">
            <h2 className="t-roomdetail-section-title">Availability Calendar</h2>
            <div className="t-roomdetail-calendar-legend">
                <div className="legend-item"><div className="legend-color available"> </div>Available</div>
                <div className="legend-item"><div className="legend-color booked"> </div>Booked</div>
            </div>
            <div className="t-roomdetail-calendar-wrapper">
                {[currentDate, nextMonthDate].map((date, index) => (
                    <div key={index} className="t-roomdetail-calendar-month">
                        <div className="t-roomdetail-calendar-month-header">
                            {index === 0 && <button onClick={goToPrevMonth} className="t-roomdetail-calendar-nav-button">&lt; Prev</button>}
                            <div></div>
                            <h3 className="t-roomdetail-calendar-month-name">{monthNames[date.getMonth()]} {date.getFullYear()}</h3>
                            <div></div>
                            {index === 1 && <button onClick={goToNextMonth} className="t-roomdetail-calendar-nav-button">Next &gt;</button>}
                        </div>
                        <div className="t-roomdetail-calendar-days-header">
                            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                        </div>
                        <div className="t-roomdetail-calendar-days-grid">{renderCalendar(date)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function RoomDetail() {
    const [roomType, setRoomType] = useState(null);
    const [roomsByFloor, setRoomsByFloor] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [bookedDates, setBookedDates] = useState([]);
    const [allRoomSchedules, setAllRoomSchedules] = useState(new Map());

    const [searchParams] = useSearchParams();
    const urlCheckin = searchParams.get('checkin');
    const urlCheckout = searchParams.get('checkout');
    const roomTypeId = searchParams.get('id');
    const preselectedRoomId = searchParams.get('roomId');

    const [checkinDate, setCheckinDate] = useState(urlCheckin || '');
    const [checkoutDate, setCheckoutDate] = useState(urlCheckout || '');

    const handleDatesChange = ({ checkin, checkout }) => {
        setCheckinDate(checkin);
        setCheckoutDate(checkout);
    };

    const groupRoomsByFloor = (rooms) => {
        if (!rooms || rooms.length === 0) return [];
        const grouped = rooms.reduce((acc, room) => {
            const floor = room.floor || 'N/A';
            if (!acc[floor]) acc[floor] = [];

            acc[floor].push({
                id: Number(room.roomId),
                number: room.roomNumber,
                capacity: room.capacity,
                roomTypeId: room.roomTypeId
            });
            return acc;
        }, {});
        return Object.entries(grouped)
            .sort(([floorA], [floorB]) => floorB - floorA)
            .map(([, roomsOnFloor]) => {
                return roomsOnFloor.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
            });
    };

    const handleRoomClick = useCallback(async (room) => {
        if (!room) return;

        setSelectedRoom(room);
        try {
            const response = await axios.get(`http://localhost:8080/api/rooms/${room.id}/schedule`, config);
            setBookedDates(response.data);
        } catch (err) {
            console.error(`Error loading Schedule ${room.id}:`, err);
            setError(`Error loading Schedule ${room.number}.`);
            setBookedDates([]);
        }
    }, [setSelectedRoom, setBookedDates, setError]);

    useEffect(() => {
        if (!roomTypeId) {
            setError("ID Room Not Found.");
            setLoading(false);
            return;
        }

        const fetchRoomData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [roomTypeResult, roomsResult] = await Promise.all([
                    axios.get(`http://localhost:8080/api/roomtypes/${roomTypeId}`),
                    axios.get(`http://localhost:8080/api/rooms/by-type/${roomTypeId}`, config)
                ]);
                setRoomType(roomTypeResult.data);
                setRoomsByFloor(groupRoomsByFloor(roomsResult.data));

                try {
                    const schedulesResponse = await axios.get(`http://localhost:8080/api/roomtypes/${roomTypeId}/schedules`, config);

                    const schedulesMap = new Map();
                    for (const booking of schedulesResponse.data) {
                        const key = Number(booking.roomId);
                        if (!schedulesMap.has(key)) {
                            schedulesMap.set(key, []);
                        }
                        schedulesMap.get(key).push({
                            checkinDate: booking.checkinDate,
                            checkoutDate: booking.checkoutDate
                        });
                    }
                    setAllRoomSchedules(schedulesMap);

                } catch (scheduleErr) {
                    console.error("Error loading all room schedules:", scheduleErr);
                    setAllRoomSchedules(new Map());
                }

            } catch (err) {
                console.error("Error loading room:", err);
                setError("Cannot load room. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchRoomData();
    }, [roomTypeId]);

    useEffect(() => {
        if (roomsByFloor.length === 0 || selectedRoom) {
            return;
        }

        let roomToSelect = null;

        if (preselectedRoomId) {
            const allRooms = roomsByFloor.flat();
            roomToSelect = allRooms.find(room => room.id === Number(preselectedRoomId));
        }

        if (!roomToSelect && roomsByFloor[0] && roomsByFloor[0][0]) {
            roomToSelect = roomsByFloor[0][0];
        }

        if (roomToSelect) {
            handleRoomClick(roomToSelect);
        }

    }, [roomsByFloor, selectedRoom, preselectedRoomId, handleRoomClick]);


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

    if (!roomType) {
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
            <div className="t-roomdetail-container">
                <div className="t-roomdetail-main-wrapper">
                    <div className="t-roomdetail-header">
                        <div className="t-roomdetail-header-decorator"></div>
                        <h1 className="t-roomdetail-header-title">{roomType.roomTypeName}</h1>
                        <div className="t-roomdetail-breadcrumbs">
                            <a href="/home">Home</a><span>&gt;</span>
                            <a href="/rooms">Rooms</a><span>&gt;</span>
                            <span className="t-roomdetail-current-page">{roomType.roomTypeName}</span>
                        </div>
                    </div>
                    <div className="t-roomdetail-layout">
                        <div className="t-roomdetail-left-column">
                            <ImageGallery roomTypeId={roomTypeId} />
                            <div className="t-roomdetail-description">
                                {roomType.description && roomType.description.split('\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                            <div className="t-roomdetail-amenities-section">
                                <h2 className="t-roomdetail-section-title">Amenity</h2>
                                <div className="t-roomdetail-amenities-grid">
                                    {amenities.map((item, index) => (
                                        <div key={index} className="t-roomdetail-amenity-item">
                                            {item.icon}<span>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {roomsByFloor.length > 0 && (
                                <div className="t-roomdetail-section">
                                    <h2 className="t-roomdetail-section-title">
                                        Rooms
                                    </h2>
                                    <div className="t-roomdetail-rooms-grid">
                                        {roomsByFloor.map((floor, floorIndex) => (
                                            <div key={floorIndex} className="t-roomdetail-rooms-row">
                                                {floor.map((room) => {
                                                    const roomSchedule = allRoomSchedules.get(room.id) || [];
                                                    const isAvailable = isDateRangeAvailable(checkinDate, checkoutDate, roomSchedule);
                                                    const isDisabled = (checkinDate && checkoutDate && !isAvailable);

                                                    return (
                                                        <div
                                                            key={room.id}
                                                            className={`t-roomdetail-room-item ${selectedRoom?.id === room.id ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                            onClick={() => !isDisabled && handleRoomClick(room)}
                                                        >
                                                            {room.number}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <AvailabilityCalendar bookedDates={bookedDates} />
                        </div>
                        <div className="t-roomdetail-right-column">
                            <div className="t-roomdetail-price-card">
                                <span className="t-roomdetail-price-label">Price Per Night</span>
                                <span className="t-roomdetail-price-amount">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(roomType.price)}
                                </span>
                            </div>

                            <BookingForm
                                roomType={roomType}
                                roomsByFloor={roomsByFloor}
                                selectedRoom={selectedRoom}
                                onRoomSelect={handleRoomClick}
                                bookedDates={bookedDates}
                                onRefreshSchedule={handleRoomClick}
                                allRoomSchedules={allRoomSchedules}
                                checkinDate={checkinDate}
                                checkoutDate={checkoutDate}
                                onDatesChange={handleDatesChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};
