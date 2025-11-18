import React, { useRef, useEffect, useCallback, useState } from 'react';
import useHousekeepingTask from '@hooks/useHousekeepingTask';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AssignHousekeeper({ isOpen, bookingRoomId, onAssignmentSuccess }) {
    const searchContainerRef = useRef(null);
    const [activeTask, setActiveTask] = useState(null);

    const {
        loading,
        selectedHousekeeper,
        setSelectedHousekeeper,
        note, setNote,
        searchTerm, setSearchTerm,
        isResultsVisible, setIsResultsVisible,
        filteredHousekeepers,
        handleSelectHousekeeper,
    } = useHousekeepingTask(isOpen);

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsResultsVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchContainerRef, setIsResultsVisible]);

    const fetchActiveTask = useCallback(async () => {
        if (!bookingRoomId) return;
        
        setActiveTask(null);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8080/api/housekeeping/tasks/booking-room/${bookingRoomId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setActiveTask(response.data);

        } catch (error) {
            if (error.response && error.response.status === 404) {
                setActiveTask(null);
            } else {
                console.error("Failed to fetch active task:", error);
            }
        }
    }, [bookingRoomId]);

    const handleCancelTask = async () => {
        if (!activeTask) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Are you sure cancel this task assignment?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel this!',
            cancelButtonText: 'No'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(
                    `http://localhost:8080/api/housekeeping/tasks/${activeTask.taskId}`,
                    { status: "Cancelled" },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );

                Swal.fire('Cancelled!', 'Task Cancelled!.', 'success');
                setActiveTask(null);
                
                if (onAssignmentSuccess) {
                    onAssignmentSuccess();
                }
            } catch (error) {
                console.error("Failed to cancel task:", error);
                Swal.fire('Error!', 'Cannot cancel.', 'error');
            }
        }
    };

    const handleAssignClick = async () => {
        if (!selectedHousekeeper || !bookingRoomId) {
            Swal.fire('Warning', 'Please select a housekeeper and ensure a booking room is specified.', 'warning');
            return;
        }

        const payload = {
            bookingRoomId: bookingRoomId,
            staffId: selectedHousekeeper.staffId
        };

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8080/api/housekeeping/tasks/assign',
                payload,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.status === 201) {
                Swal.fire('Success!', 'Task has been assigned successfully.', 'success');
                fetchActiveTask();
                if (onAssignmentSuccess) {
                    onAssignmentSuccess();
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data || 'Failed to assign task. The room may already have an active task.';
            Swal.fire('Error!', errorMessage, 'error');
            console.error("Failed to assign task:", error);
            fetchActiveTask();
        }
    };

    const fetchExistingNotes = useCallback(async () => {
        if (!bookingRoomId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8080/api/housekeeping/notes/booking-room/${bookingRoomId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setNote(response.data);
        } catch (error) {
            console.error("Failed to fetch existing notes:", error);
        }
    }, [bookingRoomId, setNote]);

    const getStatusClass = (status) => {
        if (!status) return '';
        return `t-hk-task-status-${status.toLowerCase().replace(' ', '-')}`;
    };

    useEffect(() => {
        if (isOpen) {
            fetchExistingNotes();
            fetchActiveTask();
        } else {
            setActiveTask(null);
        }
    }, [isOpen, fetchExistingNotes, fetchActiveTask]);

    if (activeTask) {
        return (
            <div className="t-housekeeping-assigned-view">
                <label className="form-label">Task Status</label>
                <div 
                    className="t-housekeeping-assigned-info"
                    role="alert"
                >
                    <div className="t-housekeeping-assigned-text">
                        Assigned to: 
                        <strong className="t-housekeeping-assigned-name">
                            {activeTask.staffName}
                        </strong>
                        <span 
                            className={`t-housekeeping-assigned-status-badge ${getStatusClass(activeTask.status)}`}
                        >
                            {activeTask.status}
                        </span>
                    </div>
                    <button
                        className="t-housekeeping-assigned-cancel-btn"
                        onClick={handleCancelTask}
                        title="Cancel Task"
                    >
                        <i className='bx bx-trash'></i>
                    </button>
                </div>

                <label className="t-housekeeping-assign-note-label">Note
                    <i className='bx bx-refresh'
                        onClick={fetchExistingNotes}
                        style={{ cursor: 'pointer', marginLeft: '8px', fontSize: '18px' }}
                    ></i>
                </label>
                <textarea
                    className="form-control mt-2 t-housekeeping-assign-note"
                    rows="4"
                    value={note}
                    readOnly={true}
                ></textarea>
            </div>
        );
    }

    return (
        <div ref={searchContainerRef}>
            <label className="form-label">Housekeeper</label>
            <div className="t-housekeeping-assign-container">
                <div className="t-housekeeping-assign-input-group">
                    <input
                        type="text"
                        className="form-control t-housekeeping-assign-search"
                        placeholder="Search by name, phone, or email..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsResultsVisible(true);
                            if (selectedHousekeeper) setSelectedHousekeeper(null);
                        }}
                        onFocus={() => setIsResultsVisible(true)}
                        disabled={loading}
                    />
                    <button
                        className="btn t-housekeeping-assign-button"
                        onClick={handleAssignClick}
                        disabled={!selectedHousekeeper || loading || !bookingRoomId}
                    >
                        Assign
                    </button>
                </div>

                {isResultsVisible && filteredHousekeepers.length > 0 && (
                    <div className="t-housekeeping-assign-results">
                        {filteredHousekeepers.map(staff => (
                            <div
                                key={staff.staffId}
                                className="t-housekeeping-assign-item"
                                onClick={() => handleSelectHousekeeper(staff)}
                            >
                                <span className="t-housekeeping-assign-item-name">{staff.fullName}</span>
                                <span className="t-housekeeping-assign-item-info">{staff.phone}</span>
                                <span className="t-housekeeping-assign-item-info">{staff.email}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <label className="t-housekeeping-assign-note-label">Note
                <i className='bx bx-refresh'
                    onClick={fetchExistingNotes}
                    style={{ cursor: 'pointer', marginLeft: '8px', fontSize: '18px' }}
                ></i>
            </label>
            <textarea
                className="form-control mt-2 t-housekeeping-assign-note"
                rows="4"
                value={note}
                readOnly="true"
                onChange={(e) => setNote(e.target.value)}
            ></textarea>
        </div>
    );
}