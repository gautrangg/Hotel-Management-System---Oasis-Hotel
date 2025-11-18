import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';

const API_BASE_URL = "http://localhost:8080/api";

export default function useCheckIn() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [isChangingRoom, setIsChangingRoom] = useState(false);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [selectedRoomNumber, setSelectedRoomNumber] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (token) {
            return {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
        }
        return {
            'Content-Type': 'application/json'
        };
    };

    const fetchCheckInList = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/check-in-list`, { headers: getAuthHeaders() });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setBookings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCheckInList();
    }, []);

    const filteredBookings = useMemo(() => {
        if (!searchQuery) return bookings;
        return bookings.filter(booking =>
            booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (booking.customerPhone && booking.customerPhone.includes(searchQuery)) ||
            booking.bookingId.toString().includes(searchQuery)
        );
    }, [bookings, searchQuery]);

    const handleChangeRoomClick = async () => {
        if (!selectedBooking) return;

        setIsChangingRoom(true);
        setLoadingRooms(true);
        setAvailableRooms([]); 

        const { roomTypeId, checkinDate, checkoutDate } = selectedBooking;
       
        const checkinDateTime = `${checkinDate}T14:00:00`; 
        const checkoutDateTime = `${checkoutDate}T12:00:00`;

        try {
            const response = await fetch(
                `${API_BASE_URL}/bookings/available-rooms?roomTypeId=${roomTypeId}&checkinDate=${checkinDateTime}&checkoutDate=${checkoutDateTime}`,
                { headers: getAuthHeaders() }
            );

            if (!response.ok) {
                throw new Error('Could not fetch available rooms.');
            }
            const data = await response.json();
            const filtered = (Array.isArray(data) ? data : [])
                .filter(room => room && room.roomId !== selectedBooking.roomId)
                .filter(room => {
                    const status = (room.status ?? room.roomStatus ?? '').toString().toUpperCase();
                    return status === 'AVAILABLE';
                });
            setAvailableRooms(filtered); 
        } catch (err) {
            alert(`Error fetching rooms: ${err.message}`);
            setIsChangingRoom(false); 
        } finally {
            setLoadingRooms(false);
        }
    };

    const handleRoomSelectChange = (e) => {
        const id = Number(e.target.value);
        setSelectedRoomId(id);
        // derive room number for display
        if (selectedBooking && id === selectedBooking.roomId) {
            setSelectedRoomNumber(selectedBooking.roomNumber);
        } else {
            const found = availableRooms.find(r => r.roomId === id);
            if (found) setSelectedRoomNumber(found.roomNumber);
        }
    };

    const closeChangeRoom = (resetToCurrent = false) => {
        if (resetToCurrent && selectedBooking) {
            setSelectedRoomId(selectedBooking.roomId);
            setSelectedRoomNumber(selectedBooking.roomNumber);
        }
        setIsChangingRoom(false);
        setAvailableRooms([]);
    };

    const openCheckInPanel = (booking) => {
        setSelectedBooking(booking);
        setIsPanelOpen(true);
        setIsChangingRoom(false);
        setAvailableRooms([]);
        setSelectedRoomId(booking.roomId);
        setSelectedRoomNumber(booking.roomNumber);
    };

    const closeCheckInPanel = () => {
        setIsPanelOpen(false);
        setSelectedBooking(null);
    };

    const handleCheckInSubmit = async (formData) => {
        if (!selectedBooking) return;

        const payload = {
            roomId: selectedRoomId, 
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            customerEmail: formData.customerEmail,
            customerCitizenId: formData.customerCitizenId,
            contactName: formData.contactName,
            contactPhone: formData.contactPhone,
            contactEmail: formData.contactEmail,
            deposit: formData.deposit,
            actualCheckin: formData.actualCheckin,
            guestDetails: formData.guestDetails
        };

        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${selectedBooking.bookingId}/check-in`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            await Swal.fire({
                title: 'Success!',
                text: 'Check-in successful!',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            closeCheckInPanel();
            fetchCheckInList();
        } catch (err) {
            await Swal.fire({
                title: 'Error!',
                text: `Check-in failed: ${err.message}`,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    return {
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
    };
}