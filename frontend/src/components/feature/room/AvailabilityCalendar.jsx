import React, { useState } from 'react';
import "@assets/roomtype/RoomDetail.css";

const AvailabilityCalendar = ({ bookedDates = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date()); 
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

export default AvailabilityCalendar;