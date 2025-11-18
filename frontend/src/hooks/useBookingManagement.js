import { useState, useEffect } from 'react';
import useDebounce from './useDebounce'; // Import hook debounce

const API_BASE_URL = "http://localhost:8080/api";

export default function useBookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State filter and search
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); 

    // State paging
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // use debounce for searchTerm
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    // call API
    const fetchBookings = async () => {
        setLoading(true);
        setError(null);

        try {
            // build URL params
            const params = new URLSearchParams({
                search: debouncedSearchTerm,
                status: statusFilter,
                page: currentPage - 1, 
                size: pageSize,
                sort: 'createAt', 
                direction: 'desc'
            });

            const response = await fetch(`${API_BASE_URL}/bookings/admin/list?${params.toString()}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); 
            setBookings(data.content); 
            setTotalPages(data.totalPages); 
            setCurrentPage(data.number + 1); 

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    
    useEffect(() => {
        fetchBookings();
    }, [debouncedSearchTerm, statusFilter, currentPage, pageSize]); 

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1); 
    };

    return {
        bookings,
        loading,
        error,
        searchTerm,
        statusFilter,
        currentPage,
        totalPages,
        pageSize,
        handleSearchChange,
        handleStatusChange,
        handlePageChange,
        handlePageSizeChange,
    };
}