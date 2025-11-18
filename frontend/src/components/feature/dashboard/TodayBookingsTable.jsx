import React from "react";
import { useNavigate } from "react-router-dom";

export default function TodayBookingsTable({ bookings }) {
    const navigate = useNavigate();

    const getStatusClass = (status) => {
        switch(status?.toUpperCase()) {
            case 'CONFIRMED': return 'status-confirmed';
            case 'CHECKED-OUT': return 'status-checked-out';
            case 'CHECKED-IN': return 'status-checked-in';
            case 'PENDING': return 'status-pending';
            case 'CANCELLED': return 'status-cancelled';
            default: return '';
        }
    };

    const handleRowClick = (bookingId) => {
        navigate(`/staff/bookings/detail/${bookingId}`);
    };

    return (
        <div className="c-today-bookings">
            <h2>Today's Check-ins</h2>
            
            {bookings.length === 0 ? (
                <div className="c-empty-bookings">
                    <i className="bx bx-calendar-x"></i>
                    <p>No check-ins scheduled for today</p>
                </div>
            ) : (
                <div className="c-bookings-table-wrapper">
                    <table className="c-bookings-table">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Room</th>
                                <th>Customer</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr 
                                    key={booking.bookingId}
                                    onClick={() => handleRowClick(booking.bookingId)}
                                >
                                    <td>#{booking.bookingId}</td>
                                    <td>{booking.roomNumber}</td>
                                    <td>{booking.customerName}</td>
                                    <td>{booking.checkInTime}</td>
                                    <td>
                                        <span className={`c-status ${getStatusClass(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}