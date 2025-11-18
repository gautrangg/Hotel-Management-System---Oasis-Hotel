import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AvailabilityCalendar from '@components/feature/room/AvailabilityCalendar';

const RoomBookingRow = ({ roomTypeData }) => {
    const { roomTypeId, roomTypeName, price, rooms, images } = roomTypeData;

    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [schedule, setSchedule] = useState([]);

    useEffect(() => {
        if (rooms && rooms.length > 0) {
            setSelectedRoomId(rooms[0].roomId);
        }
    }, [rooms]);

    const fetchSchedule = useCallback(async () => {
        if (!selectedRoomId) {
            setSchedule([]);
            return;
        }
        try {
            const response = await axios.get(`http://localhost:8080/api/rooms/${selectedRoomId}/schedule`);
            setSchedule(response.data);
        } catch (error) {
            console.error(`Lỗi khi tải lịch cho phòng ${selectedRoomId}:`, error);
            setSchedule([]);
        }
    }, [selectedRoomId]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const handleBook = () => {
        const selectedRoom = rooms.find(r => r.roomId === selectedRoomId);
        Swal.fire({
            title: 'Thông tin phòng',
            html: `
                <p><b>Loại phòng:</b> ${roomTypeName}</p>
                <p><b>Số phòng:</b> ${selectedRoom.roomNumber}</p>
                <p>Để đặt phòng, vui lòng truy cập chức năng Booking.</p>
            `,
            icon: 'info',
        });
    };

    const mainImage = images && images.length > 0 ? `http://localhost:8080/upload/rooms/${images[0].image}` : '/room1.jpg';

    return (
        <div className="t-receptionist-room-row">
            <div className="t-receptionist-room-row__section">
                <img src={mainImage} alt={roomTypeName} className='t-receptionist-room-row__section--image' />
                <div className="t-receptionist-room-row__section--details">
                    <h3 className="t-receptionist-room-row__name">{roomTypeName}</h3>

                    <div className="t-receptionist-room-row__selector-wrapper">
                        <label htmlFor={`room-select-${roomTypeId}`}>Room:</label>
                        <select
                            id={`room-select-${roomTypeId}`}
                            value={selectedRoomId || ''}
                            onChange={e => setSelectedRoomId(parseInt(e.target.value))}
                            className="t-receptionist-room-row__select"
                        >
                            {rooms && rooms.map(room => (
                                <option key={room.roomId} value={room.roomId}>
                                    {room.roomNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>



            <div className="t-receptionist-room-row__section t-receptionist-room-row__section--calendar">

                <AvailabilityCalendar bookedDates={schedule} />

            </div>

            <div className="t-receptionist-room-row__section t-receptionist-room-row__section--action">
                <div className="t-receptionist-room-row__price">
                    {new Intl.NumberFormat('vi-VN').format(price)} đ
                    <span>/ night</span>
                </div>
                <button
                    className="t-receptionist-room-row__book-button t-orange-btn"
                    onClick={handleBook}
                >
                    Book
                </button>
            </div>
        </div>
    );
};

export default RoomBookingRow;