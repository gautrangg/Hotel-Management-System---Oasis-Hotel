import React, { useState, useEffect } from 'react';
import useCheckOut from '../../../hooks/useCheckOut';
import CheckOutPanel from './CheckOutPanel';
import Pagination from '../../base/ui/Pagination';
import { formatDateTime } from '../../../utils/dateUtils';
import '@assets/booking/CheckOut.css';

export default function CheckOutList() {
    const {
        filteredList, loading, error, searchQuery, setSearchQuery,
        isPanelOpen, selectedBooking, invoiceDetails, checkoutCalculation,
        actualCheckoutTime, openCheckOutPanel, closeCheckOutPanel, 
        handleCheckOutSubmit, handleCheckoutTimeChange,
        isServiceModalOpen, openServiceModal, closeServiceModal,
        pendingServices, handleAddServiceToCart, handleRemovePendingService,
        finalTotalAmount
    } = useCheckOut();

    // const today = new Date();
    // const itemsToDisplay = filteredList.filter(booking => {
    //     if (!booking.checkoutDate) {
    //         return false;
    //     }

    //     const bookingDate = new Date(booking.checkoutDate);
    //     const isSameDay = today.getFullYear() === bookingDate.getFullYear() &&
    //                       today.getMonth() === bookingDate.getMonth() &&
    //                       today.getDate() === bookingDate.getDate();

    //     return isSameDay;
    // });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate pagination
    const totalPages = Math.max(1, Math.ceil((filteredList?.length || 0) / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = (filteredList || []).slice(startIndex, endIndex);

    // itemsToDisplay

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
        <>
            <h1>Check out</h1>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search for customer name, phone number, booking id..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="table-wrapper">
                <table className="room-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name customer</th>
                            <th>Rooms</th>
                            <th>Check out date</th>
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
                                <td><strong>{booking.rooms}</strong></td>

                                <td>{
                                    formatDateTime( booking.checkoutDate)
                                
                                }</td>
                                <td>
                                    <button
                                        className="checkout-proceed-btn"
                                        onClick={() => openCheckOutPanel(booking)}
                                    >
                                        Check out
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

            <CheckOutPanel
                isOpen={isPanelOpen}
                onClose={closeCheckOutPanel}
                bookingData={selectedBooking}
                invoiceData={invoiceDetails}
                checkoutCalculation={checkoutCalculation}
                actualCheckoutTime={actualCheckoutTime}
                onSave={handleCheckOutSubmit}
                pendingServices={pendingServices}
                openServiceModal={openServiceModal}
                isServiceModalOpen={isServiceModalOpen}
                closeServiceModal={closeServiceModal}
                handleAddServiceToCart={handleAddServiceToCart}
                handleRemovePendingService={handleRemovePendingService}
                handleCheckoutTimeChange={handleCheckoutTimeChange}
                finalTotalAmount={finalTotalAmount}
                loading={loading}
                error={error}
            />
        </>
    );
}
