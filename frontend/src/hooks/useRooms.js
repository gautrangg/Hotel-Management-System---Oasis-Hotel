import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';

const ROOMS_API_URL = "http://localhost:8080/api/rooms";
const ROOM_TYPES_API_URL = "http://localhost:8080/api/roomtypes";

export default function useRooms() {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);

    const [filters, setFilters] = useState({ type: 'all', status: 'all', price: 'all', floor: 'all' });
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [panelMode, setPanelMode] = useState('add');
    const [currentRoom, setCurrentRoom] = useState(null);

    // === Lấy token từ localStorage ===
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchData = async () => {
        try {
            const [roomsRes, typesRes] = await Promise.all([
                fetch(ROOMS_API_URL, { headers: getAuthHeaders() }),
                fetch(ROOM_TYPES_API_URL, { headers: getAuthHeaders() })
            ]);

            if (!roomsRes.ok || !typesRes.ok) throw new Error("Failed to fetch data");

            const roomsData = await roomsRes.json();
            const typesData = await typesRes.json();
            setRooms(roomsData);
            setRoomTypes(typesData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const processedRooms = useMemo(() => {
        let filteredRooms = [...rooms];

        filteredRooms = filteredRooms.filter(room => {
            const priceRange = filters.price.split('-');
            const minPrice = priceRange[0] ? parseFloat(priceRange[0]) : 0;
            const maxPrice = priceRange[1] ? parseFloat(priceRange[1]) : Infinity;
            const priceCondition = filters.price === 'all' || (room.price >= minPrice && room.price <= maxPrice);

            const floorRange = filters.floor.split('-');
            const minFloor = floorRange[0] ? parseInt(floorRange[0]) : 0;
            const maxFloor = floorRange[1] ? parseInt(floorRange[1]) : Infinity;
            const floorCondition = filters.floor === 'all' || (room.floor >= minFloor && room.floor <= maxFloor);

            return (
                (filters.type === 'all' || room.type === filters.type) &&
                (filters.status === 'all' || room.status === filters.status) &&
                priceCondition &&
                floorCondition
            );
        });

        if (sortConfig.key) {
            filteredRooms.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        return filteredRooms;
    }, [rooms, filters, sortConfig]);

    const paginatedRooms = processedRooms.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const openPanel = (mode, room = null) => {
        setPanelMode(mode);
        setCurrentRoom(room);
        setIsPanelOpen(true);
    };

    const closePanel = () => {
        setIsPanelOpen(false);
        setCurrentRoom(null);
    };

    const handleSaveRoom = async (formData) => {
        const data = new FormData();
        data.append('room_number', formData.room_number);
        data.append('floor', formData.floor);
        data.append('status', formData.status);
        data.append('room_type_id', formData.room_type_id);

        const url = panelMode === 'add' ? ROOMS_API_URL : `${ROOMS_API_URL}/${currentRoom.id}`;
        const method = panelMode === 'add' ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, { method, body: data, headers: getAuthHeaders() });
            if (!res.ok) throw new Error(await res.text());
            closePanel();
            fetchData();
            
            // Success notification with SweetAlert2
            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: `Room ${panelMode === 'add' ? 'added' : 'updated'} successfully!`,
                confirmButtonColor: '#D96704',
                timer: 2000,
                timerProgressBar: true
            });
        } catch (err) {
            // Error notification with SweetAlert2
            await Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: err.message || 'Something went wrong',
                confirmButtonColor: '#D96704'
            });
        }
    };

    const handleDeleteRoom = async (roomId) => {
        // Confirmation dialog with SweetAlert2
        const result = await Swal.fire({
            title: 'Disable Room?',
            html: `
                <div style="text-align: left;">
                    <p><strong>Are you sure you want to disable this room?</strong></p>
                    <ul style="margin-top: 10px; padding-left: 20px;">
                        <li>The room will be hidden from the list</li>
                        <li>It will not be permanently deleted</li>
                        <li>You can restore it later if needed</li>
                    </ul>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D96704',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="fas fa-ban"></i> Yes, Disable',
            cancelButtonText: '<i class="fas fa-times"></i> Cancel',
            reverseButtons: true,
            focusCancel: true
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`${ROOMS_API_URL}/${roomId}`, { method: 'DELETE', headers: getAuthHeaders() });
            if (!res.ok) throw new Error(await res.text());
            fetchData();
            
            // Success notification
            await Swal.fire({
                icon: 'success',
                title: 'Disabled!',
                html: `
                    <p>Room has been disabled successfully!</p>
                    <p style="color: #6c757d; font-size: 0.9em; margin-top: 10px;">
                        The room is now inactive and hidden from the list.
                    </p>
                `,
                confirmButtonColor: '#D96704',
                timer: 3000,
                timerProgressBar: true
            });
        } catch (err) {
            // Error notification
            await Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: err.message || 'Failed to disable room',
                confirmButtonColor: '#D96704'
            });
        }
    };

    return {
        paginatedRooms, totalRooms: processedRooms.length, roomTypes,
        currentPage, setCurrentPage, recordsPerPage, setRecordsPerPage,
        filters, handleFilterChange,
        sortConfig, requestSort,
        isPanelOpen, panelMode, currentRoom, openPanel, closePanel, handleSaveRoom, handleDeleteRoom
    };
}
