import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { formatDateTimeLocal } from '../../../utils/dateUtils';
import '@assets/booking/CheckInPanel.css';

export default function CheckInPanel({ 
    isOpen, 
    onClose, 
    bookingData, 
    onSave,
    isChangingRoom,
    availableRooms,
    loadingRooms,
    selectedRoomId,
    handleChangeRoomClick,
    handleRoomSelectChange,
    closeChangeRoom,
    selectedRoomNumber
}) {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerCitizenId: '',
        actualCheckin: '',
        roomId: null,
        roomTypeId: null,
        roomPrice: 0,
        numberOfGuests: 0,
        numberOfNights: 0
    });

    const [guestList, setGuestList] = useState([]);
    const prevIsOpenRef = useRef(false);

    useEffect(() => {
        if (bookingData) {
            const checkinDate = new Date(bookingData.checkinDate);
            const checkoutDate = new Date(bookingData.checkoutDate);
            const numberOfNights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

            setFormData({
                customerName: bookingData.contactName || bookingData.customerName || '',
                customerPhone: bookingData.contactPhone || bookingData.customerPhone || '',
                customerEmail: bookingData.contactEmail || bookingData.customerEmail || '',
                customerCitizenId: bookingData.customerCitizenId || '',
                actualCheckin: formatDateTimeLocal(new Date()),
                roomId: bookingData.roomId,
                roomTypeId: bookingData.roomTypeId,
                roomPrice: bookingData.price || 0,
                numberOfGuests: (bookingData.adult || 0) + (bookingData.children || 0),
                numberOfNights: numberOfNights
            });

            // Initialize guest list based on numberOfGuests
            const initialGuests = [];
            const totalGuests = (bookingData.adult || 0) + (bookingData.children || 0);
            for (let i = 0; i < totalGuests; i++) {
                initialGuests.push({
                    guestDetailId: null,
                    fullName: '',
                    gender: 'Male',
                    citizenId: '',
                    action: 'CREATE'
                });
            }
            setGuestList(initialGuests);
        }
    }, [bookingData]);

    useEffect(() => {
        if (isOpen && !prevIsOpenRef.current && bookingData) {
            const formattedDateTime = formatDateTimeLocal(new Date());
            setFormData(prev => ({
                ...prev,
                actualCheckin: formattedDateTime
            }));
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen, bookingData]); 

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGuestChange = (index, e) => {
        const { name, value } = e.target;
        const updatedGuests = [...guestList];
        updatedGuests[index][name] = value;
        setGuestList(updatedGuests);
    };

    const handleRoomSelectChangeLocal = (e) => {
        const selectedRoomId = Number(e.target.value);
        const selectedRoom = availableRooms.find(room => room.roomId === selectedRoomId);
        
        if (selectedRoom) {
            // Keep the same room price when changing rooms (as per requirement)
            setFormData(prev => ({
                ...prev,
                roomId: selectedRoomId,
                roomPrice: bookingData.price || 0 // Keep original price
            }));
        }
        
        handleRoomSelectChange(e);
    };

    const handleSaveRoomChange = () => {
        if (typeof closeChangeRoom === 'function') closeChangeRoom(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields (fullName is required, citizenId is optional)
        const emptyGuests = guestList.filter(guest => !guest.fullName.trim());
        if (emptyGuests.length > 0) {
            await Swal.fire({
                title: 'Thiếu thông tin',
                text: 'Vui lòng điền đầy đủ tên cho tất cả khách.',
                icon: 'warning',
                confirmButtonColor: '#d97706'
            });
            return;
        }

        // Validate Citizen ID format if provided (must be exactly 12 digits)
        const invalidCitizenIds = guestList.filter(guest => 
            guest.citizenId.trim() && !/^\d{12}$/.test(guest.citizenId.trim())
        );
        if (invalidCitizenIds.length > 0) {
            await Swal.fire({
                title: 'Citizen ID không hợp lệ',
                text: 'Citizen ID phải đủ 12 số. Vui lòng kiểm tra lại hoặc để trống nếu không có.',
                icon: 'warning',
                confirmButtonColor: '#d97706'
            });
            return;
        }

        const payload = {
            customerCitizenId: formData.customerCitizenId,
            actualCheckin: formData.actualCheckin,
            roomId: formData.roomId,
            guestDetails: guestList.map(guest => ({
                guestDetailId: guest.guestDetailId,
                fullName: guest.fullName,
                gender: guest.gender,
                // Send null if citizenId is empty, otherwise send trimmed value
                citizenId: guest.citizenId && guest.citizenId.trim() ? guest.citizenId.trim() : null,
                action: guest.action
            }))
        };

        onSave(payload);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };
    
    if (!bookingData) return null;

    return (
        <div className={`panel-overlay checkin-panel-modal ${isOpen ? 'show' : ''}`} onClick={onClose}>
            <div className="checkin-panel" onClick={(e) => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>Check-in for {bookingData.customerName}</h2>
                    <button onClick={onClose} className="panel-close-btn">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="panel-form">
                    {/* Contact Information Section */}
                    <div className="form-section">
                        <h3>Contact Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact Name <span>*</span></label>
                                <input 
                                    name="customerName" 
                                    value={formData.customerName} 
                                    onChange={handleFormChange} 
                                    readOnly 
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Phone <span>*</span></label>
                                <input 
                                    name="customerPhone" 
                                    value={formData.customerPhone} 
                                    onChange={handleFormChange} 
                                    readOnly 
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact Email <span>*</span></label>
                                <input 
                                    name="customerEmail" 
                                    value={formData.customerEmail} 
                                    onChange={handleFormChange} 
                                    type="email"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Guest Information Section */}
                    <div className="form-section">
                        <h3>Guest Information ({formData.numberOfGuests} guests)</h3>
                        <p className="guest-info-note">Please provide details for all guests staying in the room.</p>
                        {guestList.map((guest, index) => (
                            <div key={index} className="guest-row">
                                <h4>Guest {index + 1}</h4>
                                
                                {/* THAY ĐỔI BẮT ĐẦU TỪ ĐÂY:
                                  Gom 3 trường vào một div .guest-field-grid 
                                  thay vì 2 .form-row riêng biệt
                                */}
                                <div className="guest-field-grid">
                                    <div className="form-group">
                                        <label>Full Name <span>*</span></label>
                                        <input
                                            name="fullName"
                                            value={guest.fullName}
                                            onChange={(e) => handleGuestChange(index, e)}
                                            placeholder="Enter guest's full name"
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
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Citizen ID</label>
                                        <input
                                            name="citizenId"
                                            type="text"
                                            value={guest.citizenId}
                                            onChange={(e) => {
                                                // Only allow digits and limit to 12 characters
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                const updatedGuests = [...guestList];
                                                updatedGuests[index].citizenId = value;
                                                setGuestList(updatedGuests);
                                            }}
                                            placeholder="Enter citizen ID number (optional, 12 digits)"
                                            maxLength={12}
                                        />
                                    </div>
                                </div>
                                {/* KẾT THÚC THAY ĐỔI */}

                            </div>
                        ))}
                    </div>

                    {/* Booking Information Section */}
                    <div className="form-section">
                        <h3>Booking Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Check-in Date</label>
                                <div className="read-only-value">{bookingData.checkinDate}</div>
                            </div>
                            <div className="form-group">
                                <label>Check-out Date</label>
                                <div className="read-only-value">{bookingData.checkoutDate}</div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Actual Check-in Time <span>*</span></label>
                                <input 
                                    name="actualCheckin" 
                                    value={formData.actualCheckin} 
                                    onChange={handleFormChange} 
                                    type="datetime-local"
                                    readOnly
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Room Assigned</label>
                                <div className="read-only-value"><strong>Room {selectedRoomNumber || bookingData.roomNumber}</strong></div>
                                {!isChangingRoom ? (
                                    <button 
                                        type="button" 
                                        className="btn-link-change-room" 
                                        onClick={handleChangeRoomClick}
                                    >
                                        Change room?
                                    </button>
                                ) : (
                                    <div className="change-room-container">
                                        <label htmlFor="availableRoomSelect">Select a new room:</label>
                                        {loadingRooms ? (
                                            <p>Loading available rooms...</p>
                                        ) : (
                                            <select 
                                                id="availableRoomSelect"
                                                name="availableRoomSelect"
                                                value={selectedRoomId} 
                                                onChange={handleRoomSelectChangeLocal}
                                                required
                                            >
                                                <option value={bookingData.roomId}>
                                                    Room {bookingData.roomNumber} (Current)
                                                </option>
                                                {availableRooms.map(room => (
                                                    <option key={room.roomId} value={room.roomId}>
                                                        Room {room.roomNumber} (Floor {room.floor})
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {availableRooms.length === 0 && !loadingRooms && (
                                            <p className="no-rooms-note">No other available rooms of this type found.</p>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                                            <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveRoomChange}>Save</button>
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => closeChangeRoom(true)}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Avg price/night</label>
                                <div className="read-only-value">{formatCurrency((bookingData.totalPrice || 0) / (formData.numberOfNights || 1))}</div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Number of Nights</label>
                                <div className="read-only-value">{formData.numberOfNights} nights</div>
                            </div>
                            <div className="form-group">
                                <label>Total Room Cost</label>
                                <div className="read-only-value">{formatCurrency(bookingData.totalPrice)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Complete Check-in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}