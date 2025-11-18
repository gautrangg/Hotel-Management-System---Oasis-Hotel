import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useServices from './useServices';
import Swal from 'sweetalert2';

const API_BASE_URL = "http://localhost:8080/api";
const ROOMS_API_BASE_URL = "http://localhost:8080/api/rooms";
const CHECKIN_FIXED_TIME = '14:00';
const CHECKOUT_FIXED_TIME = '12:00';

export default function useBookingDetailAdmin() {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null); 
    const [formData, setFormData] = useState(null); 
    const [guestList, setGuestList] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [roomSchedule, setRoomSchedule] = useState([]);
    const [dateError, setDateError] = useState('');
    const [originalDates, setOriginalDates] = useState({ checkin: null, checkout: null });

    const [availableRooms, setAvailableRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [pendingServices, setPendingServices] = useState([]);
    
    const { services, loading: servicesLoading } = useServices();

    const isCheckOut = (status) => {
        return status.toUpperCase() === 'CHECKED-OUT';
    }

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem("token");
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }, []);

    const currentRoomId = booking?.roomId ?? null;
    const currentRoomNumber = booking?.roomNumber ?? '';

    const ensureTimeWithSeconds = (timeString) => {
        if (!timeString) return '';
        return timeString.length === 5 ? `${timeString}:00` : timeString;
    };

    const extractDatePart = (value) => {
        if (!value) return '';
        if (typeof value === 'string' && value.includes('T')) {
            return value.split('T')[0];
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const combineDateWithTime = (dateString, timeString) => {
        if (!dateString) return '';
        const normalizedTime = ensureTimeWithSeconds(timeString);
        return `${dateString}T${normalizedTime}`;
    };

    const enforceFixedTime = (dateValue, fixedTime) => {
        if (!dateValue) return '';
        const baseDate = extractDatePart(dateValue);
        if (!baseDate) return '';
        return combineDateWithTime(baseDate, fixedTime);
    };

    const fetchRoomSchedule = useCallback(async (roomId) => {
        if (!roomId) {
            setRoomSchedule([]);
            return;
        }
        try {
            const response = await fetch(`${ROOMS_API_BASE_URL}/${roomId}/schedule`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch room schedule.');
            }
            const data = await response.json();
            setRoomSchedule(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch room schedule:', err);
            setRoomSchedule([]);
        }
    }, [getAuthHeaders]);

    const validateDates = useCallback((checkin, checkout) => {
        if (!checkin || !checkout) {
            setDateError('');
            return true;
        }

        try {
            const checkinDate = new Date(checkin);
            const checkoutDate = new Date(checkout);

            if (Number.isNaN(checkinDate.getTime()) || Number.isNaN(checkoutDate.getTime())) {
                setDateError('Selected dates are invalid.');
                return false;
            }

            if (checkoutDate <= checkinDate) {
                setDateError('Check-out date must be after check-in date.');
                return false;
            }

            if (roomSchedule && roomSchedule.length > 0) {
                const hasConflict = roomSchedule.some(schedule => {
                    if (!schedule) return false;
                    
                    // Loại bỏ booking hiện tại khỏi việc kiểm tra conflict
                    if (schedule.bookingId && bookingId && 
                        Number(schedule.bookingId) === Number(bookingId)) {
                        return false;
                    }
                    
                    const rangeStart = new Date(schedule.checkinDate);
                    const rangeEnd = new Date(schedule.checkoutDate);
                    if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
                        return false;
                    }

                    return checkinDate < rangeEnd && checkoutDate > rangeStart;
                });

                if (hasConflict) {
                    setDateError('Selected dates overlap with another booking for this room.');
                    return false;
                }
            }

            setDateError('');
            return true;
        } catch (err) {
            console.error('Date validation error:', err);
            setDateError('Unable to validate selected dates.');
            return false;
        }
    }, [roomSchedule, bookingId]);

    const fetchBookingDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/admin/detail/${bookingId}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch booking details.');
            }
            const data = await response.json();
            const normalizedCheckin = enforceFixedTime(data.checkinDate, CHECKIN_FIXED_TIME);
            const normalizedCheckout = enforceFixedTime(data.checkoutDate, CHECKOUT_FIXED_TIME);
            const normalizedData = {
                ...data,
                checkinDate: normalizedCheckin,
                checkoutDate: normalizedCheckout
            };

            setBooking(data);
            setFormData(normalizedData); 
            // Chỉ giữ lại các guest hiện có, đánh dấu action là UPDATE
            setGuestList(data.guestDetails.map(guest => ({ ...guest, action: 'UPDATE' })));
            setOriginalDates({ checkin: normalizedCheckin, checkout: normalizedCheckout });
            await fetchRoomSchedule(data.roomId);
         } catch (err) {
             setError(err.message);
             toast.error(err.message);
         } finally {
             setLoading(false);
         }
    }, [bookingId, fetchRoomSchedule, getAuthHeaders]);

    useEffect(() => {
        fetchBookingDetail();
    }, [fetchBookingDetail]);

    useEffect(() => {
        if (formData?.checkinDate && formData?.checkoutDate) {
            validateDates(formData.checkinDate, formData.checkoutDate);
        }
    }, [formData?.checkinDate, formData?.checkoutDate, validateDates]);

    useEffect(() => {
        if (formData?.roomId) {
            fetchRoomSchedule(formData.roomId);
        }
    }, [formData?.roomId, fetchRoomSchedule]);

    const fetchAvailableRooms = useCallback(async () => {
        const roomTypeId = formData?.roomTypeId;
        const checkinDate = formData?.checkinDate;
        const checkoutDate = formData?.checkoutDate;

        if (!roomTypeId || !checkinDate || !checkoutDate || dateError) {
            setAvailableRooms([]);
            return;
        }

        setLoadingRooms(true);
        try {
            const params = new URLSearchParams({
                roomTypeId,
                checkinDate,
                checkoutDate,
            });

            const response = await fetch(`${API_BASE_URL}/bookings/available-rooms?${params.toString()}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('Could not fetch available rooms.');
            }

            const roomsData = await response.json();
            const filtered = (Array.isArray(roomsData) ? roomsData : [])
                .filter(room => room && room.roomId !== currentRoomId)
                .filter(room => {
                    const status = (room.status ?? room.roomStatus ?? '').toString().toUpperCase();
                    return status === 'AVAILABLE';
                });
            setAvailableRooms(filtered);
        } catch (err) {
            toast.error(err.message);
            setAvailableRooms([]);
        } finally {
            setLoadingRooms(false);
        }
    }, [formData?.roomTypeId, formData?.checkinDate, formData?.checkoutDate, getAuthHeaders, dateError, currentRoomId]);

    useEffect(() => {
        fetchAvailableRooms();
    }, [fetchAvailableRooms]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'checkinDate' || name === 'checkoutDate') {
            handleDateChange(name, value);
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (field, dateValue) => {
        const fixedTime = field === 'checkinDate' ? CHECKIN_FIXED_TIME : CHECKOUT_FIXED_TIME;
        const combined = dateValue ? combineDateWithTime(dateValue, fixedTime) : '';

        setFormData(prev => {
            const updated = prev ? { ...prev, [field]: combined } : { [field]: combined };
            const nextCheckin = field === 'checkinDate' ? combined : prev?.checkinDate;
            const nextCheckout = field === 'checkoutDate' ? combined : prev?.checkoutDate;
            validateDates(nextCheckin, nextCheckout);
            return updated;
        });
    };

    const handleGuestChange = (index, e) => {
        const { name, value } = e.target;
        const updatedGuests = [...guestList];
        updatedGuests[index][name] = value;
        // Đảm bảo action luôn là UPDATE khi chỉnh sửa
        if (!updatedGuests[index].action || updatedGuests[index].action === 'CREATE') {
            updatedGuests[index].action = 'UPDATE';
        }
        setGuestList(updatedGuests);
    };

    const openServiceModal = () => setIsServiceModalOpen(true);
    const closeServiceModal = () => setIsServiceModalOpen(false);

    const handleAddServiceToCart = (service, quantity) => {
        const newService = {
            ...service,
            quantity,
            total: service.pricePerUnit * quantity,
        };
        setPendingServices(prev => [...prev, newService]);
        closeServiceModal();
        toast.success(`Added ${service.serviceName} to booking`);
    };

    const handleRemovePendingService = (serviceId) => {
        setPendingServices(prev => prev.filter(s => s.serviceId !== serviceId));
        toast.success('Service removed from booking');
    };

    const handleSave = async () => {
        setIsSaving(true);

        const isValid = validateDates(formData?.checkinDate, formData?.checkoutDate);
        if (!isValid) {
            setIsSaving(false);
            toast.error('Please resolve date conflicts before saving.');
            return;
        }
        
        // Chỉ gửi các guest có action UPDATE (bỏ qua CREATE và DELETE)
        const payload = {
            ...formData,
            roomId: formData.roomId,
            guestDetails: guestList
                .filter(guest => guest.action === 'UPDATE' && guest.guestDetailId)
                .map(guest => ({
                    guestDetailId: guest.guestDetailId,
                    fullName: guest.fullName,
                    gender: guest.gender,
                    citizenId: guest.citizenId,
                    action: 'UPDATE'
                }))
        };
        if (pendingServices.length > 0) {
            payload.pendingServices = pendingServices.map(service => ({
                serviceId: service.serviceId,
                quantity: service.quantity,
                serviceName: service.serviceName,
                pricePerUnit: service.pricePerUnit,
                total: service.total
            }));
        }

        console.log('Sending payload:', payload);
        console.log('Pending services:', pendingServices);

        try {
            const response = await fetch(`${API_BASE_URL}/bookings/admin/update/${bookingId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();
            console.log('Save response:', response.status, responseText);

            if (!response.ok) {
                throw new Error(responseText || 'Failed to update booking.');
            }

            setPendingServices([]);
            await fetchBookingDetail();

            await Swal.fire({
                title: 'Success!',
                text: 'Booking updated successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            
            } catch (err) {
                await Swal.fire({
                    title: 'Error!',
                    text: `Save failed: ${err.message}`,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            } finally {
                setIsSaving(false);
            }
    };

    const handleCancelBooking = async () => {
        // Kiểm tra status trước khi hiển thị confirm
        const currentStatus = formData?.status?.toUpperCase();
        
        if (currentStatus !== 'CONFIRMED' && currentStatus !== 'PENDING') {
            await Swal.fire({
                title: 'Cannot Cancel Booking',
                html: 'Chỉ có thể hủy những booking có trạng thái <b>CONFIRMED</b> hoặc <b>PENDING</b>.<br><br>Trạng thái hiện tại: <b>' + formData?.status + '</b>',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        // Hiển thị confirm dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            html: 'Bạn có chắc chắn muốn hủy booking <b>#' + bookingId + '</b>?<br><br>Hành động này không thể hoàn tác.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_BASE_URL}/bookings/admin/cancel/${bookingId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders()
                });

                const responseText = await response.text();

                if (!response.ok) {
                    throw new Error(responseText || 'Failed to cancel booking.');
                }

                // Refresh booking data
                await fetchBookingDetail();

                await Swal.fire({
                    title: 'Cancelled!',
                    text: 'Booking has been cancelled successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } catch (err) {
                await Swal.fire({
                    title: 'Error!',
                    text: `Cancel failed: ${err.message}`,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const handleRoomSelectChange = (event) => {
        const selectedId = Number(event.target.value);
        const selectedRoom = selectedId === currentRoomId
            ? { roomNumber: currentRoomNumber }
            : availableRooms.find(room => room.roomId === selectedId);

        setFormData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                roomId: selectedId,
                roomNumber: selectedRoom?.roomNumber ?? prev.roomNumber
            };
        });
    };

    return {
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
        handleCancelBooking,
        navigate,
        dateError,
        availableRooms,
        loadingRooms,
        
        isServiceModalOpen,
        pendingServices,
        services,
        servicesLoading,
        openServiceModal,
        closeServiceModal,
        handleAddServiceToCart,
        handleRemovePendingService,
        isCheckOut,
        isChangeRoomDisabled: !booking?.roomId || !booking?.roomTypeId
    };
}