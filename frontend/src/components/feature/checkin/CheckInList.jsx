import React, { useState, useEffect } from 'react';
import useCheckIn from '@hooks/useCheckIn';
import CheckInPanel from './CheckInPanel';
import Pagination from '../../base/ui/Pagination';

export default function CheckInList() {
    const {
        filteredBookings,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        isPanelOpen,
        selectedBooking,
        openCheckInPanel,
        closeCheckInPanel,
        handleCheckInSubmit,
        isChangingRoom,
        availableRooms,
        loadingRooms,
        selectedRoomId,
        selectedRoomNumber,
        handleChangeRoomClick,
        handleRoomSelectChange,
        closeChangeRoom,
    } = useCheckIn();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate pagination
    const totalPages = Math.max(1, Math.ceil((filteredBookings?.length || 0) / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = (filteredBookings || []).slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    // Reset to page 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Ensure currentPage doesn't exceed totalPages
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="checkin-main-content">
            <div className="checkin-header">
            </div>

            <div className="table-wrapper">
                <table className="checkin-table">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Customer Name</th>
                            <th>Room Type</th>
                            <th>Room Number</th>
                            <th>Check-in Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(booking => (
                            <tr key={booking.bookingId}>
                                <td>{booking.bookingId}</td>
                                <td>
                                    <div>{booking.customerName}</div>
                                    <small>{booking.customerPhone}</small>
                                </td>
                                <td>{booking.roomTypeName}</td>
                                <td><strong>{booking.roomNumber}</strong></td> 
                                <td>{booking.checkinDate}</td>
                                <td><span className="status-confirmed">Confirmed</span></td>
                                <td>
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => openCheckInPanel(booking)}
                                    >
                                        Check-in
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="table-footer">
                <div className="records-per-page">
                    <span>Records per page:</span>
                    <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            <CheckInPanel
                isOpen={isPanelOpen}
                onClose={closeCheckInPanel}
                bookingData={selectedBooking}
                onSave={handleCheckInSubmit}
                isChangingRoom={isChangingRoom}
                availableRooms={availableRooms}
                loadingRooms={loadingRooms}
                selectedRoomId={selectedRoomId}
                selectedRoomNumber={selectedRoomNumber}
                handleChangeRoomClick={handleChangeRoomClick}
                handleRoomSelectChange={handleRoomSelectChange}
                closeChangeRoom={closeChangeRoom}
            />
        </div>
    );
}