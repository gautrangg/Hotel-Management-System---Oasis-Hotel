import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function useHousekeepingTask(isOpen, bookingData) {
    const [housekeepers, setHousekeepers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedHousekeeper, setSelectedHousekeeper] = useState(null);
    const [note, setNote] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isResultsVisible, setIsResultsVisible] = useState(false);

    const resetState = useCallback(() => {
        setHousekeepers([]);
        setSelectedHousekeeper(null);
        setNote('');
        setSearchTerm('');
        setIsResultsVisible(false);
    }, []);

    useEffect(() => {
        const fetchHousekeepers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/staffs/available-housekeepers',
                    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
                );
                if (Array.isArray(response.data)) {
                    setHousekeepers(response.data);
                } else {
                    setHousekeepers([]);
                }
            } catch (error) {
                console.error("Failed to fetch housekeepers:", error);
                setHousekeepers([]);
                Swal.fire('Error', 'Could not load available housekeepers.', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchHousekeepers();
        } else {
            resetState();
        }
    }, [isOpen, resetState]);


    const handleSelectHousekeeper = (staff) => {
        setSelectedHousekeeper(staff);
        setSearchTerm(staff ? staff.fullName : '');
        setIsResultsVisible(false);
    };

    const handleAssignTask = async () => {
        if (!bookingData?.bookingId) {
            Swal.fire('Error', 'Booking information is missing.', 'error');
            return;
        }
        
        if (!selectedHousekeeper) {
            Swal.fire('Warning', 'Please select a housekeeper to assign.', 'warning');
            return;
        }
        
        try {
            await Swal.fire('Success', `${selectedHousekeeper.fullName} has been assigned.`, 'success');
            resetState();
        } catch (error) {
            console.error("Failed to assign task:", error);
            Swal.fire('Error', 'Could not assign the task.', 'error');
        }
    };

    const filteredHousekeepers = (Array.isArray(housekeepers) ? housekeepers : []).filter(hk => {
        const term = searchTerm.toLowerCase();

        if (!term) return true;

        const fullNameMatch = hk.fullName.toLowerCase().includes(term);
        const phoneMatch = hk.phone?.includes(term);
        const emailMatch = hk.email?.toLowerCase().includes(term);

        return fullNameMatch || phoneMatch || emailMatch;
    });

    return {
        loading,
        selectedHousekeeper,
        setSelectedHousekeeper,
        note, setNote,
        searchTerm, setSearchTerm,
        isResultsVisible, setIsResultsVisible,
        filteredHousekeepers,
        handleSelectHousekeeper,
        handleAssignTask,
    };
}