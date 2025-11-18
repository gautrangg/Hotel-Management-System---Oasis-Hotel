import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AvailabilityCalendar from '@components/feature/room/AvailabilityCalendar';
import "@assets/roomtype/ListRoomForBook.css";
import Pagination from "@components/base/ui/Pagination";
import { useNavigate } from 'react-router-dom';


const ListRoomForBook = () => {
    const [allRoomTypes, setAllRoomTypes] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [filterType, setFilterType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllRoomTypes = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/roomtypes/all/details',
                    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
                );
                const roomTypes = response.data;
                setAllRoomTypes(roomTypes);

                if (roomTypes.length > 0 && roomTypes[0].rooms.length > 0) {
                    const firstRoomType = roomTypes[0];
                    const firstRoom = firstRoomType.rooms[0];
                    setSelectedRoom({
                        ...firstRoom,
                        roomTypeName: firstRoomType.roomTypeName,
                        price: firstRoomType.price,
                        images: firstRoomType.images
                    });
                }
            } catch (err) {
                console.error("Error Loading:", err);
                setError('Cannot load room data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllRoomTypes();
    }, []);

    const fetchSchedule = useCallback(async () => {
        if (!selectedRoom) {
            setSchedule([]);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/rooms/${selectedRoom.roomId}/schedule`,
                token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
            );
            setSchedule(response.data);
        } catch (error) {
            console.error(`Error loading schedule for room ${selectedRoom.roomId}:`, error);
            setSchedule([]);
        }
    }, [selectedRoom]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const handleBook = () => {
        
        if (!selectedRoom) return;
        navigate("/staff/booking");
    };

    const allRooms = allRoomTypes.flatMap(roomType =>
        roomType.rooms.map(room => ({
            ...room,
            roomTypeName: roomType.roomTypeName,
            price: roomType.price,
            images: roomType.images,
            adult: roomType.adult,
            children: roomType.children,
        }))
    );

    const filteredRooms = useMemo(() => {
        return allRooms
            .filter(room => filterType === '' || room.roomTypeName === filterType)
            .filter(room => room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allRooms, filterType, searchTerm]);

    const totalPages = Math.ceil(filteredRooms.length / recordsPerPage);
    const indexOfLastItem = currentPage * recordsPerPage;
    const indexOfFirstItem = indexOfLastItem - recordsPerPage;
    const currentRooms = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterType, searchTerm]);

    const mainImage = selectedRoom?.images && selectedRoom.images.length > 0
        ? `http://localhost:8080/upload/rooms/${selectedRoom.images[0].image}`
        : '/default-room.jpg';

    if (loading) {
        return <div className="t-receptionist-room-booking__container"><p>Loading rooms...</p></div>;
    }

    if (error) {
        return <div className="t-receptionist-room-booking__container"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="t-receptionist-room-booking__container">
            {/* --- TOP SECTION: Detail View --- */}
            {selectedRoom && (
                <div className="t-receptionist-room-detail-card">
                    <div className="t-receptionist-room-detail-card__left">
                        <img src={mainImage} alt={selectedRoom.roomTypeName} className='t-receptionist-room-detail-card__image' />
                        <div className='t-receptionist-room-detail-card__title'>
                            <h3>{selectedRoom.roomTypeName}</h3>
                            <p>{selectedRoom.roomNumber}</p>
                        </div>
                    </div>
                    <div className="t-receptionist-room-detail-card__center">
                        <AvailabilityCalendar bookedDates={schedule} />
                    </div>
                    <div className="t-receptionist-room-detail-card__right">
                        <div className="t-receptionist-room-detail-card__price">
                            {new Intl.NumberFormat('vi-VN').format(selectedRoom.price)} đ
                            <span> / night</span>
                        </div>
                        <button onClick={handleBook} className="t-orange-btn">
                            Book
                        </button>
                    </div>
                </div>
            )}

            {/* --- BOTTOM SECTION: Room List Table --- */}
            <div className="t-receptionist-room-list">
                <div className="t-receptionist-room-list__filters">
                    <select
                        className="t-receptionist-room-list__filter-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        {allRoomTypes.map(rt => (
                            <option key={rt.roomTypeId} value={rt.roomTypeName}>{rt.roomTypeName}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Search by room number..."
                        className="t-receptionist-room-list__filter-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <table className="t-receptionist-room-list__table">
                    <thead>
                        <tr>
                            <th>Room</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Adults</th>
                            <th>Children</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRooms.length > 0 ? (
                            currentRooms.map(room => (
                                <tr
                                    key={room.roomId}
                                    onClick={() => setSelectedRoom(room)}
                                    className={selectedRoom?.roomId === room.roomId ? 'selected-row' : ''}
                                >
                                    <td>{room.roomNumber}</td>
                                    <td>{room.roomTypeName}</td>
                                    <td>{new Intl.NumberFormat('vi-VN').format(room.price)}đ</td>
                                    <td>
                                        <span className={`status ${room.status?.toLowerCase()}`}>
                                            {room.status}
                                        </span>
                                    </td>
                                    <td>{room.adult}</td>
                                    <td>{room.children}</td>
                                    <td>
                                        <button className="t-orange-btn">
                                            Select
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No rooms found.</td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={7}>
                                <div className="table-footer">
                                    <div className="records-per-page">
                                        <span>Show:</span>
                                        <select value={recordsPerPage} onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                        <span>entries</span>
                                    </div>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            </td>
                        </tr>
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default ListRoomForBook;