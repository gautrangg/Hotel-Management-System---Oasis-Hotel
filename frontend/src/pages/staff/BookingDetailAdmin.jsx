import React from 'react';
import useBookingDetailAdmin from '../../hooks/useBookingDetailAdmin';
import StaffLayout from '../../layouts/StaffLayout';
import { ClipLoader } from 'react-spinners'; // (npm install react-spinners)
import AddServiceModal from '../../components/feature/booking/AddServiceModal';
import { formatDateTime } from '../../utils/dateUtils';

// Helper định dạng - using formatDateTime from utils for display
const formatDateTimeDisplay = formatDateTime;

const formatCurrency = (value) => {
    if (value == null) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function BookingDetailAdmin() {
        const {
            booking,
            formData,
            guestList,
            loading,
            error,
            isSaving,
            handleFormChange,
            handleDateChange,
            handleRoomSelectChange,
            handleGuestChange,
            handleSave,
            navigate,
            isChangeRoomDisabled, // Cảnh báo từ hook
            availableRooms,
            loadingRooms,
            
            // Service functions
            isServiceModalOpen,
            pendingServices,
            services,
            servicesLoading,
            openServiceModal,
            closeServiceModal,
            handleAddServiceToCart,
            handleRemovePendingService,
            isCheckOut,
            
            // Cancel booking function
            handleCancelBooking,
            dateError
        } = useBookingDetailAdmin();

    const formatDateInputValue = (dateValue) => {
        if (!dateValue) return '';
        try {
            if (typeof dateValue === 'string' && dateValue.includes('T')) {
                return dateValue.split('T')[0];
            }
            const date = new Date(dateValue);
            if (Number.isNaN(date.getTime())) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (err) {
            console.error('Failed to format date input value:', err, dateValue);
            return '';
        }
    };

    if (loading) {
        return <StaffLayout><div className="loading-full-page"><ClipLoader size={50} /></div></StaffLayout>;
    }

    if (error || !formData) {
        return <StaffLayout><div className="error-indicator">Error: {error || 'Booking data not found.'}</div></StaffLayout>;
    }

    // Chỉ hiển thị các guest có sẵn (không có action CREATE hoặc DELETE)
    const visibleGuests = guestList.filter(g => g.action === 'UPDATE' || (!g.action && g.guestDetailId));

    return (
        <StaffLayout>
            <div className="booking-detail-admin-container">
                <div className="booking-detail-header">
                    <h1>Booking Detail: #{booking.bookingId}</h1>
                    <div className="header-actions">
                            <button className="btn btn-secondary" onClick={() => navigate('/staff/bookings')}>
                                <i className="fa fa-arrow-left"></i> Back to List
                            </button>
                    </div>
                </div>

                <div className="booking-detail-grid">
                    {/* --- CỘT TRÁI: THÔNG TIN CHÍNH --- */}
                    <div className="detail-column-main">
                        <div className="detail-card">
                            <h3>Contact Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Contact Name</label>
                                    <input type="text" name="contactName" value={formData.contactName} onChange={handleFormChange} />
                                </div>
                                <div className="form-group">
                                    <label>Contact Phone</label>
                                    <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleFormChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Contact Email</label>
                                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleFormChange} />
                            </div>
                        </div>

                        <div className="detail-card">
                            <h3>Booking Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Check-in Date</label>
                                    <input
                                        type="date"
                                        name="checkinDate"
                                        value={formatDateInputValue(formData.checkinDate)}
                                        disabled={isCheckOut(formData.status)}
                                        onChange={(e) => handleDateChange('checkinDate', e.target.value)}
                                    />
                                    
                                </div>
                                <div className="form-group">
                                    <label>Check-out Date</label>
                                    <input
                                        type="date"
                                        name="checkoutDate"
                                        value={formatDateInputValue(formData.checkoutDate)}
                                        disabled={isCheckOut(formData.status)}
                                        onChange={(e) => handleDateChange('checkoutDate', e.target.value)}
                                    />
                                 
                                </div>
                            </div>
                            {dateError && (
                                <div className="form-error" style={{ color: '#dc2626', marginTop: '8px' }}>
                                    {dateError}
                                </div>
                            )}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <input type="text" value={formData.status} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Deposit</label>
                                    
                                    <input type="number" name="deposit" 
                                    disabled={isCheckOut(formData.status)}
                                    value={formData.deposit} onChange={handleFormChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <button 
                                    type="button"
                                    className="btn btn-danger" 
                                    onClick={handleCancelBooking}
                                    style={{ width: '100%', marginTop: '10px' }}
                                >
                                    <i className=""></i>Cancel Booking
                                </button>
                            </div>
                        </div>

                        {/* --- PHẦN KHÁCH ĐI CÙNG --- */}
                        <div className="detail-card">
                            <div className="guest-list-header">
                                <h3>Guest Details (Total: {formData.numberOfGuests})</h3>
                            </div>
                            <p className="guest-info-note">Please provide details for all guests staying in the room.</p>
                            <div className="guest-list-form">
                                {visibleGuests.length === 0 && (
                                    <p>No guest details available.</p>
                                )}
                                {visibleGuests.map((guest, index) => (
                                    <div className="guest-row" key={guest.guestDetailId || `guest-${index}`}>
                                        <h4>Guest {index + 1}</h4>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Full Name <span>*</span></label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    placeholder="Enter guest's full name"
                                                    value={guest.fullName}
                                                    onChange={(e) => handleGuestChange(index, e)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Gender <span>*</span></label>
                                                <select
                                                    name="gender"
                                                    value={guest.gender}
                                                    onChange={(e) => handleGuestChange(index, e)}
                                                    required
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Citizen ID</label>
                                                <input
                                                    type="text"
                                                    name="citizenId"
                                                    placeholder="Enter citizen ID number (optional)"
                                                    value={guest.citizenId || ''}
                                                    onChange={(e) => handleGuestChange(index, e)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI: THÔNG TIN PHÒNG & DỊCH VỤ --- */}
                    <div className="detail-column-side">
                        <div className="detail-card">
                            <h3>Room & Service</h3>
                            <div className="form-group">
                                <label>Assigned Room</label>
                                <input type="text" value={`${formData.roomNumber} (${formData.roomTypeName})`} disabled />
                            </div>
                            
                            {/* Chức năng đổi phòng (sẽ hoạt động khi DTO được cập nhật) */}
                            {isChangeRoomDisabled && (
                                <div className="form-group-note">
                                    <i className="fas fa-info-circle"></i> 
                                    <b>Note:</b> To enable 'Change Room', please update 
                                    <code>AdminBookingDetailDTO</code> on the backend to include <code>roomId</code> and <code>roomTypeId</code>.
                                </div>
                            )}

                            <div className="form-group">
                                <label>Change Room (Optional)</label>
                                {loadingRooms ? (
                                    <p>Loading available rooms...</p>
                                ) : (
                                    <select 
                                        name="roomId" 
                                        value={formData.roomId != null ? String(formData.roomId) : ''} 
                                        onChange={handleRoomSelectChange}
                                        disabled={isChangeRoomDisabled}
                                    >
                                        {formData.roomId && (
                                            <option value={String(formData.roomId)}>
                                                {formData.roomNumber} (Current)
                                            </option>
                                        )}
                                        {availableRooms.map(room => (
                                            <option key={room.roomId} value={String(room.roomId)}>
                                                {room.roomNumber} (Floor {room.floor})
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {!loadingRooms && !isChangeRoomDisabled && availableRooms.length === 0 && (
                                    <small className="form-note">No other available rooms for the selected dates.</small>
                                )}
                            </div>
                             
                            <hr />
                            <label>Service Requests</label>
                            <ul className="service-request-list">
                                {formData.serviceRequests.length === 0 && pendingServices.length === 0 && <li>No services requested.</li>}
                                
                                {/* Existing services */}
                                {formData.serviceRequests.map(service => (
                                    <li key={service.serviceRequestId}>
                                        <span>{service.serviceName} (x{service.quantity})</span>
                                        <span className={`status-badge-sm ${service.status.toLowerCase()}`}>{service.status}</span>
                                        <span className="service-price">{formatCurrency(service.totalPrice)}</span>
                                    </li>
                                ))}
                                
                                {/* Pending services */}
                                {pendingServices.map(service => (
                                    <li key={`pending-${service.serviceId}`} style={{backgroundColor: '#fff3cd'}}>
                                        <span>{service.serviceName} (x{service.quantity})</span>
                                        <span className="status-badge-sm pending">PENDING</span>
                                        <span className="service-price">{formatCurrency(service.total)}</span>
                                        <button 
                                            className="btn-icon btn-delete" 
                                            onClick={() => handleRemovePendingService(service.serviceId)}
                                            style={{marginLeft: '10px'}}
                                        >
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button className="service-add-btn" onClick={openServiceModal}>
                                <i className="fa fa-plus"></i> Add Service
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- THANH ACTION DÍNH --- */}
                <div className="booking-detail-footer">
                    <button className="btn btn-secondary" onClick={() => navigate('/staff/bookings')}>
                        Cancel
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSave} 
                        disabled={isSaving}
                    >
                        {isSaving ? <ClipLoader size={16} color="#fff" /> : 'Save Changes'}
                    </button>
                </div>
                </div>
                
                {/* Add Service Modal */}
                <AddServiceModal
                    isOpen={isServiceModalOpen}
                    onClose={closeServiceModal}
                    services={servicesLoading ? [] : services}
                    onAdd={handleAddServiceToCart}
                />
            </StaffLayout>
        );
    }