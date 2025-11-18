// src/components/DateRangePicker.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import '@assets/price/DateRangePicker.css';

const API_URL = 'http://localhost:8080/api/price-adjustments';

const DateRangePicker = ({ basePrice, onDatesChange, onClose, bookedDates = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1));
    const [checkinDate, setCheckinDate] = useState(null);
    const [checkoutDate, setCheckoutDate] = useState(null);
    const [hoverDate, setHoverDate] = useState(null);
    const [priceAdjustments, setPriceAdjustments] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchAdjustments = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    API_URL,
                    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
                );
                setPriceAdjustments(response.data);
            } catch (error) {
                console.error("Failed to fetch price adjustments:", error);
            }
        };
        fetchAdjustments();

        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const getAdjustedPrice = useCallback((date) => {
        if (!basePrice) return null;

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const adjustment = priceAdjustments.find(adj =>
            dateString >= adj.startDate && dateString <= adj.endDate
        );

        if (adjustment) {
            if (adjustment.adjustmentType === 'PERCENTAGE') {
                return basePrice * (1 + parseFloat(adjustment.adjustmentValue) / 100);
            }
            if (adjustment.adjustmentType === 'FIXED_AMOUNT') {
                return basePrice + parseFloat(adjustment.adjustmentValue);
            }
        }
        return basePrice;
    }, [basePrice, priceAdjustments]);

    const handleDateClick = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today || isDateBooked(date, bookedDates)) return;

        if (!checkinDate || (checkinDate && checkoutDate)) {
            setCheckinDate(date);
            setCheckoutDate(null);
        } else if (date > checkinDate) {
            setCheckoutDate(date);
        } else {
            setCheckinDate(date);
            setCheckoutDate(null);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleConfirm = () => {
        if (checkinDate && checkoutDate) {
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            onDatesChange({
                checkin: formatDate(checkinDate),
                checkout: formatDate(checkoutDate)
            });

            onClose();
        }
    };

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

    const renderMonth = (dateToRender) => {
        const month = dateToRender.getMonth();
        const year = dateToRender.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="pa-day empty"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const isPast = dayDate <= today;
            const isBooked = isDateBooked(dayDate, bookedDates);
            const isDisabled = isPast || isBooked;

            let dayClasses = "pa-day";
            if (isDisabled) {
                dayClasses += " disabled";
            } else {
                const isCheckin = checkinDate && dayDate.getTime() === checkinDate.getTime();
                const isCheckout = checkoutDate && dayDate.getTime() === checkoutDate.getTime();
                
                if (isCheckin) dayClasses += " check-in";
                if (isCheckout) dayClasses += " check-out";

                const isBetween = (d, start, end) => d > start && d < end;
                if (checkinDate && checkoutDate && isBetween(dayDate, checkinDate, checkoutDate)) {
                    dayClasses += " in-range";
                } else if (checkinDate && !checkoutDate && hoverDate && isBetween(dayDate, checkinDate, hoverDate)) {
                    dayClasses += " in-range";
                }
            }
            
            const price = getAdjustedPrice(dayDate);

            days.push(
                <div
                    key={i}
                    className={dayClasses}
                    onClick={() => !isDisabled && handleDateClick(dayDate)}
                    onMouseEnter={() => !isDisabled && setHoverDate(dayDate)}
                >
                    <div className="pa-day-number">{i}</div>
                    {price && !isDisabled && (
                        <div className="pa-day-price">
                            {new Intl.NumberFormat('vi-VN').format(price / 1000)}k
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    const nextMonthDate = useMemo(() => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + 1);
        return d;
    }, [currentDate]);

    const goToPrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className={`pa-date-picker-backdrop ${isVisible ? 'visible' : ''}`} onClick={handleClose}>
            <div className="pa-date-picker-container" onClick={(e) => e.stopPropagation()}>
                <div className="pa-calendars-wrapper">
                    {/* Calendar 1 */}
                    <div className="pa-calendar">
                        <div className="pa-calendar-header">
                            <button onClick={goToPrevMonth} className="pa-nav-button">&lt;</button>
                            <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                            <div></div>
                        </div>
                        <div className="pa-days-header">
                            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                        </div>
                        <div className="pa-days-grid" onMouseLeave={() => setHoverDate(null)}>
                            {renderMonth(currentDate)}
                        </div>
                    </div>
                    {/* Calendar 2 */}
                    <div className="pa-calendar">
                        <div className="pa-calendar-header">
                            <div></div>
                            <h3>{monthNames[nextMonthDate.getMonth()]} {nextMonthDate.getFullYear()}</h3>
                            <button onClick={goToNextMonth} className="pa-nav-button">&gt;</button>
                        </div>
                        <div className="pa-days-header">
                            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                        </div>
                        <div className="pa-days-grid" onMouseLeave={() => setHoverDate(null)}>
                             {renderMonth(nextMonthDate)}
                        </div>
                    </div>
                </div>
                <div className="pa-date-picker-footer">
                    <p>Daily rates starting from</p>
                    
                    <button onClick={onClose} className="pa-go-back-btn">GO BACK</button>

                    <button
                        onClick={handleConfirm}
                        className="pa-confirm-btn"
                        disabled={!checkinDate || !checkoutDate}
                    >
                        CONFIRM DATES OF STAY
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateRangePicker;