import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import '@assets/housekeeping/HousekeepingTask.css';
import Header from "@components/layout/Header";
import Sidebar from "@components/layout/Sidebar";
import jwtDecode from 'jwt-decode';
import Swal from 'sweetalert2';
import UpdateTask from "@components/feature/housekeeping/UpdateTask";
import Pagination from "@components/base/ui/Pagination";

export default function HousekeepingTask() {
    const [currentTasks, setCurrentTasks] = useState([]);
    const [historyTasks, setHistoryTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const [historyPage, setHistoryPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);


    const getStatusClass = (status) => {
        if (!status) return '';
        return `t-hk-task-status-${status.toLowerCase().replace(' ', '-')}`;
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${hours}:${minutes} ${day}/${month}/${year}`;
    };

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please log in.');
                setLoading(false);
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const staffId = decodedToken.staffId;

                if (!staffId) {
                    setError('Invalid token: Staff ID not found.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    `http://localhost:8080/api/housekeeping/staff/${staffId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setCurrentTasks(response.data.currentTasks || []);
                setHistoryTasks(response.data.historyTasks || []);
            } catch (err) {
                setError('Failed to fetch housekeeping tasks.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const handleSortToggle = () => {
        setSortOrder(prevOrder => (prevOrder === 'desc' ? 'asc' : 'desc'));
    };

    const processedCurrentTasks = useMemo(() => {
        return [...currentTasks].sort((a, b) => {
            const dateA = new Date(a.assignTime);
            const dateB = new Date(b.assignTime);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [currentTasks, sortOrder]);

    const processedHistoryTasks = useMemo(() => {
        return historyTasks
            .filter(task => {
                const lowerCaseSearch = searchTerm.toLowerCase();
                if (!lowerCaseSearch) return true;

                const roomMatch = task.roomNumber.toLowerCase().includes(lowerCaseSearch);
                const bookingMatch = String(task.bookingId).includes(lowerCaseSearch);
                const noteMatch = task.note?.toLowerCase().includes(lowerCaseSearch) || false;

                return roomMatch || bookingMatch || noteMatch;
            })
            .sort((a, b) => {
                const dateA = new Date(a.assignTime);
                const dateB = new Date(b.assignTime);
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });
    }, [historyTasks, searchTerm, sortOrder]);

    const handleOpenPopup = (task) => {
        setSelectedTask(task);
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedTask(null);
    };

    const handleAcceptTask = async (task) => {
        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire('Error', 'Authentication required.', 'error');
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:8080/api/housekeeping/tasks/${task.taskId}`,
                { status: "In Progress" },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const updatedTask = response.data;

            setCurrentTasks(prev =>
                prev.map(t => (t.taskId === updatedTask.taskId ? updatedTask : t))
            );

            Swal.fire('Accepted!', 'Task is now In Progress.', 'success');

        } catch (err) {
            Swal.fire('Error', 'Failed to accept task.', 'error');
            console.error("Failed to accept task:", err);
        }
    };

    const handleSaveTask = async (taskToSave) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(
                `http://localhost:8080/api/housekeeping/tasks/${taskToSave.taskId}`,
                { note: taskToSave.note, status: taskToSave.status },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const updatedTask = response.data;

            if (updatedTask.status === 'Completed') {
                setCurrentTasks(prev => prev.filter(t => t.taskId !== updatedTask.taskId));
                setHistoryTasks(prev => [updatedTask, ...prev]);
            } else {
                setCurrentTasks(prev => prev.map(t => (t.taskId === updatedTask.taskId ? updatedTask : t)));
            }

            Swal.fire('Success', 'Task updated successfully!', 'success');
            handleClosePopup();

        } catch (err) {
            Swal.fire('Error', 'Failed to update task.', 'error');
            console.error("Failed to update task:", err);
        }
    };

    const totalHistoryPages = Math.ceil(processedHistoryTasks.length / recordsPerPage);
    const indexOfLast = historyPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentHistory = processedHistoryTasks.slice(indexOfFirst, indexOfLast);

    useEffect(() => {
        setHistoryPage(1);
    }, [searchTerm, sortOrder]);


    if (loading) {
        return <div className="staff-main-content">Loading...</div>;
    }

    if (error) {
        return <div className="staff-main-content" style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div className="staff-dashboard">
            <Header />
            <Sidebar />
            <div className="staff-main-content">
                {/* Phần Task hiện tại */}
                <section className="t-hk-task-container">
                    <header className="t-hk-task-header">
                        <h2>Housekeeping Task</h2>
                        <div className="t-hk-task-controls">
                            <button className="t-hk-task-time-btn" onClick={handleSortToggle}>
                                Time <span className="t-hk-task-arrow">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                            </button>
                        </div>
                    </header>
                    <div className="t-hk-task-table">
                        <div className="t-hk-task-table-header">
                            <div>Room</div>
                            <div>Booking</div>
                            <div>Assign Time</div>
                            <div>Status</div>
                            <div></div>
                        </div>
                        {processedCurrentTasks.length > 0 ? processedCurrentTasks.map(task => (
                            <div key={task.taskId} className="t-hk-task-table-row">
                                <div>{task.roomNumber}</div>
                                <div>{task.bookingId}</div>
                                <div>{formatDateTime(task.assignTime)}</div>
                                <div>
                                    <span className={`t-hk-task-status t-hk-task-status-assigned`}>
                                        {task.status}
                                    </span>
                                </div>
                                <div>
                                    {task.status === 'Assigned' && (
                                        <button 
                                            className="t-hk-task-accept-btn"
                                            onClick={() => handleAcceptTask(task)}
                                        >
                                            Accept Job
                                        </button>
                                    )}
                                    {task.status === 'In Progress' && (
                                        <button 
                                            className="t-hk-task-update-btn"
                                            onClick={() => handleOpenPopup(task)}
                                        >
                                            Update
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : <div className="t-hk-task-empty-row">No current tasks.</div>}
                    </div>
                </section>

                {/* Phần Lịch sử Task */}
                <section className="t-hk-task-container">
                    <header className="t-hk-task-header">
                        <h2>Housekeeping History</h2>
                        <div className="t-hk-task-controls">
                            <input
                                type="text"
                                placeholder="Search room, booking, note..."
                                className="t-hk-task-search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="t-hk-task-time-btn" onClick={handleSortToggle}>
                                Time <span className="t-hk-task-arrow">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                            </button>
                        </div>
                    </header>
                    <div className="t-hk-task-table">
                        <div className="t-hk-task-table-header t-hk-task-history-header">
                            <div>Room</div>
                            <div>Booking</div>
                            <div>Assign Time</div>
                            <div>Finished Time</div>
                            <div>Note</div>
                            <div>Status</div>
                        </div>

                        {currentHistory.length > 0 ? currentHistory.map(task => (
                            <div key={task.taskId} className="t-hk-task-table-row t-hk-task-history-row">
                                <div>{task.roomNumber}</div>
                                <div>{task.bookingId}</div>
                                <div>{formatDateTime(task.assignTime)}</div>
                                <div>{formatDateTime(task.finishTime)}</div>
                                <div>{task.note}</div>
                                <div>
                                    <span className={`t-hk-task-status ${getStatusClass(task.status)}`}>
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                        )) : <div className="t-hk-task-empty-row">No task history.</div>}


                        <div className="table-footer">
                            <div className="records-per-page">
                                <span>Show:</span>
                                <select value={recordsPerPage} onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setHistoryPage(1); }}>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <Pagination
                                currentPage={historyPage}
                                totalPages={totalHistoryPages}
                                onPageChange={setHistoryPage}
                            />
                        </div>

                    </div>
                </section>
            </div>
            {isPopupOpen && (
                <UpdateTask
                    task={selectedTask}
                    onClose={handleClosePopup}
                    onSave={handleSaveTask}
                    formatDateTime={formatDateTime}
                />
            )}
        </div>
    );
}