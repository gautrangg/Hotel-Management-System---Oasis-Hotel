import React, { useState, useEffect, useCallback, useRef } from 'react';
import useServices from '../../../hooks/useServices';
import AddServiceModal from './AddServiceModal';
import CheckOutInvoice from './CheckOutInvoice';
import Swal from 'sweetalert2';
import AssignHousekeeper from './AssignHousekeeper'; 
import { formatDateTime } from '../../../utils/dateUtils';
import axios from 'axios';

export default function CheckOutPanel({
    isOpen,
    onClose,
    bookingData,
    invoiceData,
    checkoutCalculation,
    actualCheckoutTime,
    onSave,
    pendingServices,
    openServiceModal,
    isServiceModalOpen,
    closeServiceModal,
    handleAddServiceToCart,
    handleRemovePendingService,
    handleCheckoutTimeChange,
    finalTotalAmount,
    loading,
    error
}) {
    const [showInvoice, setShowInvoice] = useState(false);
    const { services, loading: servicesLoading } = useServices();
    const [hasNote, setHasNote] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const isMountedRef = useRef(true);

    // Check note status
    // checkHousekeepingStatus được dùng để thăm dò (poll) API GET /api/housekeeping/notes/booking-room/{id} liên tục (mỗi 2 giây).
    const checkHousekeepingStatus = useCallback(async () => {
        if (!bookingData?.bookingRoomId || !isOpen || !isMountedRef.current) {
            if (isMountedRef.current) {
                setHasNote(false);
            }
            return;
        }

        if (!isMountedRef.current) return;
        setCheckingStatus(true);
        
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Check for note
            try {
                const noteResponse = await axios.get(
                    `http://localhost:8080/api/housekeeping/notes/booking-room/${bookingData.bookingRoomId}`,
                    { headers }
                );
                if (isMountedRef.current) {
                    const noteText = noteResponse.data || '';
                    setHasNote(noteText.trim().length > 0);
                }
            } catch (error) {
                if (!isMountedRef.current) return;
                console.error('Error checking note:', error);
                setHasNote(false);
            }
        } catch (error) {
            if (!isMountedRef.current) return;
            console.error('Error checking housekeeping status:', error);
            setHasNote(false);
        } finally {
            if (isMountedRef.current) {
                setCheckingStatus(false);
            }
        }
    }, [bookingData?.bookingRoomId, isOpen]);

    // Reset showInvoice when panel opens
    useEffect(() => {
        if (isOpen) {
            setShowInvoice(false);
        }
    }, [isOpen]);

    // Check status when panel opens or booking data changes
    useEffect(() => {
        isMountedRef.current = true;
        
        if (!isOpen || !bookingData?.bookingRoomId) {
            setHasNote(false);
            return () => {
                isMountedRef.current = false;
            };
        }

        checkHousekeepingStatus();
        
        // Poll every 2 seconds to check for updates
        const interval = setInterval(() => {
            if (isMountedRef.current) {
                checkHousekeepingStatus();
            }
        }, 2000);
        
        return () => {
            isMountedRef.current = false;
            clearInterval(interval);
        };
    }, [isOpen, bookingData?.bookingRoomId, checkHousekeepingStatus]);

    const handleCheckOutClick = () => {
        if (!canProcessPayment || checkingStatus) {
            return;
        }
        setShowInvoice(true);
    };

    const handleInvoiceClose = () => {
        setShowInvoice(false);
        onClose();
    };

    const handleCompletePayment = async (paymentData) => {
            await onSave(paymentData);
            setShowInvoice(false);
    };

    const handleAddService = () => {
        openServiceModal();
    };

    const handleRemoveService = (serviceId) => {
        handleRemovePendingService(serviceId);
    };

    const handleAssignmentSuccess = () => {
        // Re-check status after assignment
        setTimeout(checkHousekeepingStatus, 500);
    };

    const formatCurrency = (value) => {
        if (typeof value !== 'number') {
            return '0 ₫';
        }
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    // Check if payment button should be enabled
    const canProcessPayment = hasNote;

    if (!isOpen || !bookingData) return null;

    // Show loading state
    if (loading) {
        return (
            <div className={`panel-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
                <div
                    className={`room-panel checkout-panel ${isOpen ? 'open' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="panel-header">
                        <h2>Loading checkout data...</h2>
                        <button onClick={onClose} className="panel-close-btn">&times;</button>
                    </div>
                    <div className="panel-content">
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div className="loading-spinner"></div>
                            <p>Loading invoice data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className={`panel-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
                <div
                    className={`room-panel checkout-panel ${isOpen ? 'open' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="panel-header">
                        <h2>Error loading checkout data</h2>
                        <button onClick={onClose} className="panel-close-btn">&times;</button>
                    </div>
                    <div className="panel-content">
                        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                            <p>Error: {error}</p>
                            <button onClick={onClose} className="btn btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {!showInvoice ? (
                <div className={`panel-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
                    <div
                        className={`room-panel checkout-panel ${isOpen ? 'open' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="panel-header">
                            <h2>Check out for {bookingData.customerName}</h2>
                            <button onClick={onClose} className="panel-close-btn">&times;</button>
                        </div>

                        <div className="panel-form">
                            {/* Vẫn hiển thị component assign  */}
                            <AssignHousekeeper isOpen={isOpen} bookingRoomId={bookingData.bookingRoomId} onAssignmentSuccess={handleAssignmentSuccess}/>
                            
                            <div className="checkout-preview">
                                <h3>Booking Summary</h3>
                                <div className="preview-info">
                                    <p><strong>Customer:</strong> {bookingData.customerName}</p>
                                    <p><strong>Phone:</strong> {bookingData.customerPhone}</p>
                                    <p><strong>Check-in:</strong> {formatDateTime(bookingData.actualCheckin || bookingData.checkinDate)}</p>
                                    <p><strong>Check-out:</strong> {formatDateTime(bookingData.checkoutDate)}</p>
                                </div>

                                {/* Status indicators */}
                                <div className="checkout-status-indicators" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                                    {!hasNote && (
                                        <div style={{ marginTop: '10px', fontSize: '12px', color: '#856404', fontStyle: 'italic' }}>
                                            Please provide housekeeping notes (minibar, damages...) before processing payment.
                                        </div>
                                    )}
                                    {hasNote && (
                                        <div style={{ marginTop: '10px', fontSize: '12px', color: '#28a745', fontStyle: 'italic' }}>
                                            Note confirmed. Ready for payment.
                                        </div>
                                    )}
                                </div>

                                <div className="preview-actions" style={{ marginTop: '15px' }}>
                                    <button 
                                        className={`btn checkout-proceed-btn ${canProcessPayment ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={handleCheckOutClick}
                                        disabled={!canProcessPayment}
                                        style={{
                                            opacity: canProcessPayment ? 1 : 0.6,
                                            cursor: canProcessPayment ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        Process Payment & Check-out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <CheckOutInvoice
                    bookingId={bookingData.bookingId}
                    bookingData={bookingData}
                    onClose={handleInvoiceClose}
                    onCompletePayment={handleCompletePayment}
                    invoiceData={invoiceData}
                    checkoutCalculation={checkoutCalculation}
                    pendingServices={pendingServices}
                    onAddService={handleAddService}
                    onRemoveService={handleRemoveService}
                    actualCheckoutTime={actualCheckoutTime}
                    onCheckoutTimeChange={handleCheckoutTimeChange}
                />
            )}

            <AddServiceModal
                isOpen={isServiceModalOpen}
                onClose={closeServiceModal}
                services={servicesLoading ? [] : services}
                onAdd={handleAddServiceToCart}
            />
        </>
    );
}