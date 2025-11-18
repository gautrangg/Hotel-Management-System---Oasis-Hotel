import React from 'react';
import { useNavigate } from 'react-router-dom';
import useBookingManagement from '../../hooks/useBookingManagement';
import Pagination from '../../components/base/ui/Pagination'; // Đảm bảo đường dẫn đúng
import StaffLayout from '../../layouts/StaffLayout'; // Giả định anh có StaffLayout

// Helper function để định dạng ngày
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
        return 'Invalid Date';
    }
};

// Helper function để định dạng tiền
const formatCurrency = (value) => {
    if (value == null) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
};

// Helper function để hiển thị class CSS cho trạng thái
const getStatusClass = (status) => {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s === 'confirmed') return 'status-confirmed';
    if (s === 'checked-in') return 'status-checked-in';
    if (s === 'checked-out') return 'status-checked-out';
    if (s === 'cancelled') return 'status-cancelled';
    return 'status-pending';
};

export default function BookingManagement() {
    const {
        bookings,
        loading,
        error,
        searchTerm,
        statusFilter,
        currentPage,
        totalPages,
        pageSize,
        handleSearchChange,
        handleStatusChange,
        handlePageChange,
        handlePageSizeChange,
    } = useBookingManagement();

    const navigate = useNavigate();

    const handleViewDetails = (bookingId) => {
        navigate(`/staff/bookings/detail/${bookingId}`);
    };

    return (
        <StaffLayout> {/* Bọc trong StaffLayout nếu có */}
            <div className="booking-management-container">
                <h1>Booking Management</h1>

                {/* Thanh tìm kiếm và bộ lọc */}
                <div className="filter-search-bar">
                    <select
                        name="statusFilter"
                        value={statusFilter}
                        onChange={handleStatusChange}
                        className="filter-select"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CHECKED-IN">Checked-in</option>
                        <option value="CHECKED-OUT">Checked-out</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Search by name, phone, email, or room number..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    {/* Nút Search có thể không cần vì đã có debounce */}
                </div>

                {/* Hiển thị loading hoặc lỗi */}
                {loading && <div className="loading-indicator">Loading bookings...</div>}
                {error && <div className="error-indicator">Error: {error}</div>}

                {/* Bảng dữ liệu */}
                {!loading && !error && (
                    <div className="table-wrapper">
                        <table className="room-table booking-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Contact Info</th>
                                    <th>Room</th>
                                    <th>Dates</th>
                                    <th>Guests</th>
                                    <th>Deposit</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length > 0 ? bookings.map(booking => (
                                    <tr key={booking.bookingId}>
                                        <td>{booking.bookingId}</td>
                                        <td>
                                            <div><strong>{booking.customerName}</strong></div>
                                            <small>{booking.customerPhone}</small>
                                            <br/>
                                            <small>{booking.customerEmail}</small>
                                        </td>
                                        <td>
                                            <div><strong>{booking.roomNumber}</strong></div>
                                            <small>{booking.roomTypeName}</small>
                                        </td>
                                        <td>
                                            <div>Check-in: {formatDateTime(booking.checkinDate)}</div>
                                            <small>Check-out: {formatDateTime(booking.checkoutDate)}</small>
                                        </td>
                                        <td>{booking.numberOfGuests}</td>
                                        <td>{formatCurrency(booking.deposit)}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-icon btn-edit"
                                                title="View Details"
                                                onClick={() => handleViewDetails(booking.bookingId)}
                                            >
                                                <i className="fa fa-eye"></i> {/* Hoặc fa-pencil-alt */}
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center' }}>No bookings found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Phân trang và Page size */}
                {!loading && totalPages > 0 && (
                    <div className="table-footer">
                        <div className="records-per-page">
                            <span>Bookings per page:</span>
                            <select value={pageSize} onChange={handlePageSizeChange}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}