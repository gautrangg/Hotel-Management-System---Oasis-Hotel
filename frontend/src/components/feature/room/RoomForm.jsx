import React, { useState, useEffect } from 'react';

export default function RoomForm({ isOpen, onClose, mode, roomData, roomTypes, onSave }) {
    const [formData, setFormData] = useState({});

    const resolveRoomTypeId = () => {
        if (roomData?.roomTypeId) {
            return roomData.roomTypeId;
        }
        if (roomData?.type) {
            const matchedType = roomTypes.find(rt => rt.roomTypeName === roomData.type);
            if (matchedType) {
                return matchedType.roomTypeId;
            }
        }
        return roomTypes.length > 0 ? roomTypes[0].roomTypeId : '';
    };

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit') {
                setFormData({
                    room_number: roomData?.roomNumber || '',
                    floor: roomData?.floor ?? '',
                    status: roomData?.status || 'Available',
                    room_type_id: resolveRoomTypeId()
                });
            } else {
                setFormData({
                    room_number: '',
                    floor: '',
                    status: 'Available',
                    room_type_id: ''
                });
            }
        }
    }, [isOpen, mode, roomData, roomTypes]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className={`panel-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
            <div className={`room-panel ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>{mode === 'add' ? 'ADD ROOM' : 'EDIT ROOM'}</h2>
                    <button onClick={onClose} className="panel-close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="panel-form room-form">
                    <div className="form-group">
                        <label>Room Number <span>*</span></label>
                        <input name="room_number" value={formData.room_number || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Floor <span>*</span></label>
                        <input type="number" name="floor" value={formData.floor || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Status <span>*</span></label>
                        <select name="status" value={formData.status || 'Available'} onChange={handleChange} required>
                            <option value="Available">Available</option>
                            <option value="Occupied">Occupied</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Cleaning">Cleaning</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Room Type <span>*</span></label>
                        <select name="room_type_id" value={formData.room_type_id || ''} onChange={handleChange} required>
                            <option value="" disabled>-- Select a Room Type --</option>
                            {roomTypes.map(type => (
                                <option key={type.roomTypeId} value={type.roomTypeId}>
                                    {type.roomTypeName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="panel-submit-button">
                            {mode === 'add' ? 'Add Room' : 'Update Room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};