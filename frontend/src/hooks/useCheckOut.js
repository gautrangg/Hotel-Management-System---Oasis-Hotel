import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { formatDateTime } from '../utils/dateUtils';

const API_BASE_URL = "http://localhost:8080/api";

export default function useCheckOut() {
    const [checkOutList, setCheckOutList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [invoiceDetails, setInvoiceDetails] = useState(null);
    const [checkoutCalculation, setCheckoutCalculation] = useState(null);

    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [pendingServices, setPendingServices] = useState([]);
    const [actualCheckoutTime, setActualCheckoutTime] = useState(new Date().toISOString().slice(0, 16));

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    // Fetch check-out list, call api /bookings/check-out-list để lấy danh sách khách đang "Checked-in" => BookingService.getCheckOutList()
    const fetchCheckOutList = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/check-out-list`, { headers: getAuthHeaders() });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setCheckOutList(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCheckOutList();
    }, []);

    const filteredList = useMemo(() => {
        if (!searchQuery) return checkOutList;
        return checkOutList.filter(booking =>
            booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (booking.customerPhone && booking.customerPhone.includes(searchQuery)) ||
            booking.bookingId.toString().includes(searchQuery)
        );
    }, [checkOutList, searchQuery]);

    const fetchInvoiceDetails = async (bookingId) => {
        setInvoiceDetails(null);
        try {
            // Try the invoice endpoint first
            const response = await fetch(`${API_BASE_URL}/invoices/view/booking/${bookingId}`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                // Fallback to booking endpoint
                const fallbackResponse = await fetch(`${API_BASE_URL}/bookings/${bookingId}/invoice-details`, {
                    headers: getAuthHeaders()
                });
                
                if (!fallbackResponse.ok) {
                    throw new Error(`Could not fetch invoice details. Status: ${response.status}`);
                }
                const fallbackData = await fallbackResponse.json();
                setInvoiceDetails(fallbackData);
                return;
            }
            const data = await response.json();

            // Format dates using utility function (dd/mm/yyyy HH:mm)
            if (data.actualCheckin) {
                data.formattedActualCheckin = formatDateTime(data.actualCheckin);
            }
            
            // Format checkout dates if available
            if (data.checkinDate) {
                data.formattedCheckinDate = formatDateTime(data.checkinDate);
            }
            
            if (data.checkoutDate) {
                data.formattedCheckoutDate = formatDateTime(data.checkoutDate);
            }

            setInvoiceDetails(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const calculateCheckout = async (bookingId, checkoutTime) => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/calculate-checkout`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    actualCheckoutTime: checkoutTime
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to calculate checkout: ${errorText}`);
            }
            const data = await response.json();
            setCheckoutCalculation(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };


    // khi nhân viên nhấn nút check out
    // Open check-out panel, call api /bookings/{bookingId}/invoice-details và /bookings/{bookingId}/calculate-checkout 
    // để lấy chi tiết hóa đơn và tính toán phí => BookingService.getInvoiceDetails() và BookingService.calculateCheckout()
    /*
    Gọi API GET /api/invoices/view/booking/... để lấy invoiceData (dịch vụ đã dùng, thông tin phòng).
    Gọi API POST /api/bookings/{id}/calculate-checkout với thời gian hiện tại để lấy checkoutCalculation (kịch bản check-out, phí phạt trễ).
    */

    const openCheckOutPanel = async (booking) => {
        setSelectedBooking(booking);
        setPendingServices([]);
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        setActualCheckoutTime(currentDateTime);
        setIsPanelOpen(true);
        
        try {
            await fetchInvoiceDetails(booking.bookingId);
            await calculateCheckout(booking.bookingId, new Date(currentDateTime).toISOString());
        } catch (err) {
            setError(err.message);
        }
    };

    const closeCheckOutPanel = () => {
        setIsPanelOpen(false);
        setSelectedBooking(null);
        setInvoiceDetails(null);
        setCheckoutCalculation(null);
        setPendingServices([]); 
    };

    const finalTotalAmount = useMemo(() => {
        if (!checkoutCalculation) return 0;
        const pendingTotal = pendingServices.reduce((sum, service) => sum + service.total, 0);
        return parseFloat(checkoutCalculation.finalAmount) + pendingTotal;
    }, [checkoutCalculation, pendingServices]);

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
    };

    const handleRemovePendingService = (serviceId) => {
        setPendingServices(prev => prev.filter(s => s.serviceId !== serviceId));
    };

    // khi nhân viên nhấn nút xử lý thanh toán
    // Call api /bookings/{bookingId}/check-out để xử lý thanh toán => BookingService.performCheckOut()
    // đóng gói tất cả dữ liệu (paymentMethod, pendingServices, penalty, actualCheckoutTime) vào một payload.
    const handleCheckOutSubmit = async (formData) => {
        if (!selectedBooking) return;

        const finalServicesPayload = pendingServices.map(s => ({
            serviceId: s.serviceId,
            quantity: s.quantity,
        }));

        const payload = {
            paymentMethod: formData.paymentMethod,
            finalServices: finalServicesPayload,
            penalty: formData.penalty || 0,
            actualCheckoutTime: actualCheckoutTime,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${selectedBooking.bookingId}/check-out`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Check-out failed');
            }

            closeCheckOutPanel();
            fetchCheckOutList();
        } catch (err) {
            throw err;
        }
    };

    const handleCheckoutTimeChange = async (newTime) => {
        setActualCheckoutTime(newTime);
        if (selectedBooking) {
            try {
                await calculateCheckout(selectedBooking.bookingId, newTime);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    return {
        filteredList,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        isPanelOpen,
        selectedBooking,
        invoiceDetails,
        checkoutCalculation,
        actualCheckoutTime,
        openCheckOutPanel,
        closeCheckOutPanel,
        handleCheckOutSubmit,
        handleCheckoutTimeChange,

        isServiceModalOpen,
        openServiceModal,
        closeServiceModal,
        pendingServices,
        handleAddServiceToCart,
        handleRemovePendingService,
        finalTotalAmount,
    };
}
