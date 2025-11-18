import React, { useState, useEffect, useMemo } from 'react';
import Pagination from '@components/base/ui/Pagination';
import LeaveRequestTable from './LeaveRequest';
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2"

export default function ScheduleRequest() {
    // --- State quản lý tab hiện tại ---
    const [activeTab, setActiveTab] = useState('changeShift');

    // --- State lưu dữ liệu gốc từ API ---
    const [changeShiftRequests, setChangeShiftRequests] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);

    // --- State phân trang ---
    const [pendingPage, setPendingPage] = useState(1);
    const [historyPage, setHistoryPage] = useState(1);
    const itemsPerPage = 5;

    // --- State lọc dữ liệu ---
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState(null);

    // --- Gọi API lấy dữ liệu hai loại request ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}` };

        Promise.all([
            fetch("http://localhost:8080/api/change-shift-requests", { headers })
                .then(res => res.ok ? res.json() : Promise.reject('Error fetching change shift requests')),
            fetch("http://localhost:8080/api/leave-requests", { headers })
                .then(res => res.ok ? res.json() : Promise.reject('Error fetching leave requests'))
        ])
            .then(([changeShiftData, leaveData]) => {
                setChangeShiftRequests(changeShiftData);
                setLeaveRequests(leaveData);
            })
            .catch(err => console.error("Error fetching data:", err));
    }, []);

    // --- Reset trang khi đổi tab, tìm kiếm hoặc lọc ---
    useEffect(() => {
        setPendingPage(1);
        setHistoryPage(1);
    }, [activeTab, searchTerm, dateFilter]);

    // --- Lọc dữ liệu theo tab, từ khóa và ngày ---
    const { pendingRequests, historyRequests } = useMemo(() => {
        const sourceData = activeTab === 'changeShift' ? changeShiftRequests : leaveRequests;
        let filteredData = sourceData;

        // Lọc theo từ khóa
        if (searchTerm) {
            filteredData = filteredData.filter(req =>
                req.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.reason?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Lọc theo ngày
        if (dateFilter) {
            const today = new Date();
            const startDate = new Date();
            startDate.setDate(today.getDate() - dateFilter + 1);
            startDate.setHours(0, 0, 0, 0);
            today.setHours(23, 59, 59, 999);

            filteredData = filteredData.filter(req => {
                const requestDateStr = activeTab === 'changeShift' ? req.shiftDate : req.date;
                if (!requestDateStr) return false;

                const requestDate = new Date(requestDateStr);
                return requestDate >= startDate && requestDate <= today;
            });
        }

        // Phân loại request theo trạng thái
        const pending = filteredData.filter(req => req.status === 'Pending');
        const history = filteredData.filter(req => req.status !== 'Pending');

        return { pendingRequests: pending, historyRequests: history };
    }, [activeTab, changeShiftRequests, leaveRequests, searchTerm, dateFilter]);

    // --- Tính toán phân trang ---
    const totalPendingPages = Math.ceil(pendingRequests.length / itemsPerPage);
    const displayedPending = pendingRequests.slice((pendingPage - 1) * itemsPerPage, pendingPage * itemsPerPage);

    const totalHistoryPages = Math.ceil(historyRequests.length / itemsPerPage);
    const displayedHistory = historyRequests.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);

    // --- Xử lý phê duyệt hoặc từ chối request ---
    const handleProcessRequest = async (requestId, newStatus) => {
        const action = newStatus.toLowerCase();
        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `Do you really want to ${action} this request?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `Yes, ${action} it!`,
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;


        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire("Error", "No token found. Please login again.", "error");
            return;
        }

        // Giải mã token để lấy ID người phê duyệt
        let approverId;
        try {
            const decoded = jwtDecode(token);
            approverId = decoded.staffId;
        } catch (err) {
            console.error("Invalid token:", err);
            Swal.fire("Error", "Invalid token. Please login again.", "error");
            return;
        }

        const endpoint = `http://localhost:8080/api/update-requests/${requestId}/${action}`;

        try {
            const res = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ approverStaffId: approverId })
            });

            if (res.ok) {
                Swal.fire("Success", `Request has been ${newStatus}!`, "success");
                const updateState = (prevState) =>
                    prevState.map((req) =>
                        req.requestId === requestId ? { ...req, status: newStatus } : req
                    );

                if (activeTab === "changeShift") {
                    setChangeShiftRequests(updateState);
                } else {
                    setLeaveRequests(updateState);
                }
            } else {
                const errorData = await res.json();
                Swal.fire("Error", `Failed to process request: ${errorData.error || "Unknown error"}`, "error");
            }
        } catch (error) {
            console.error("Error processing request:", error);
            Swal.fire("Error", "An error occurred while processing the request.", "error");
        }
    };

    // --- Xử lý xóa request trong lịch sử ---
    const handleDeleteHistory = async (requestId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this request?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;


        const token = localStorage.getItem("token");
        const endpoint = `http://localhost:8080/api/delete-schedule-requests/${requestId}`;

        try {
            const res = await fetch(endpoint, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (res.ok) {
                const message = await res.text();
                Swal.fire("Success", message || "Successfully deleted the request.", "success");

                if (activeTab === "changeShift") {
                    setChangeShiftRequests(prev =>
                        prev.filter(req => req.requestId !== requestId)
                    );
                } else {
                    setLeaveRequests(prev =>
                        prev.filter(req => req.requestId !== requestId)
                    );
                }
            } else {
                let errorMessage = "Unknown error";
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch {
                    errorMessage = await res.text();
                }
                Swal.fire("Error", `Failed to delete: ${errorMessage}`, "error");
            }
        } catch (error) {
            console.error("Error deleting request:", error);
            Swal.fire("Error", "An error occurred during deletion.", "error");
        }
    };

    // --- Xử lý thay đổi bộ lọc ngày ---
    const handleDateFilterChange = (e) => {
        const value = e.target.value;
        setDateFilter(value ? parseInt(value, 10) : null);
    };

    // --- Render bảng yêu cầu đổi ca ---
    const renderChangeShiftTable = (data, isHistory = false) => {
        if (!data || data.length === 0) {
            const message = isHistory ? "No history of change shift requests found." : "No pending change shift requests.";
            return <p>{message}</p>;
        }
        return (
            <table className="quynh-custom-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Requester</th>
                        <th>Target Staff</th>
                        <th>Original Shift</th>
                        <th>Target Shift</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Options</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((req, index) => (
                        <tr key={req.requestId}>
                            <td>{index + 1 + ((isHistory ? historyPage : pendingPage) - 1) * itemsPerPage}</td>
                            <td>{req.requesterName}</td>
                            <td>{req.targetStaff || 'N/A'}</td>
                            <td>{`${req.shiftDate} ${req.shift}`}</td>
                            <td>{req.targetShift ? `${req.shiftDate} ${req.targetShift}` : 'N/A'}</td>
                            <td>{req.reason}</td>
                            <td style={{ color: req.status === 'Pending' ? 'orange' : req.status === 'Approved' ? 'green' : 'red', fontWeight: "bold" }}>{req.status}</td>
                            <td>
                                {!isHistory ? (
                                    <>
                                        <button className="quynh-approve-btn" onClick={() => handleProcessRequest(req.requestId, 'Approved')}>Approve</button>
                                        <button className="quynh-reject-btn" onClick={() => handleProcessRequest(req.requestId, 'Rejected')}>Reject</button>
                                    </>
                                ) : (
                                    <button className="quynh-delete-btn" onClick={() => handleDeleteHistory(req.requestId)}>Delete</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    // render ui
    return (
        <div className="quynh-staff-request-container">
            {/* --- Thanh tab chọn loại request --- */}
            <div className="quynh-tabs">
                <button
                    className={`quynh-tab-btn ${activeTab === 'changeShift' ? 'quynh-active' : ''}`}
                    onClick={() => setActiveTab('changeShift')}
                >
                    Change Shift Requests
                </button>
                <button
                    className={`quynh-tab-btn ${activeTab === 'leaveRequest' ? 'quynh-active' : ''}`}
                    onClick={() => setActiveTab('leaveRequest')}
                >
                    Leave Requests
                </button>
            </div>

            {/* --- Bộ lọc tìm kiếm và ngày --- */}
            <div className="quynh-filter-controls">
                <input
                    type="text"
                    placeholder="Search by requester name or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="quynh-date-filter-group">
                    <label htmlFor="quynh-date-filter-select">Filter by date:</label>
                    <select
                        id="quynh-date-filter-select"
                        value={dateFilter || ''}
                        onChange={handleDateFilterChange}
                    >
                        <option value="">All Time</option>
                        <option value="1">Today</option>
                        <option value="7">Last 7 days</option>
                        <option value="14">Last 14 days</option>
                        <option value="30">Last 30 days</option>
                    </select>
                </div>
            </div>

            {/* --- Phần danh sách yêu cầu đang chờ duyệt --- */}
            <div className="quynh-request-section">
                <h3>Pending Requests</h3>
                {activeTab === 'changeShift'
                    ? renderChangeShiftTable(displayedPending, false)
                    : <LeaveRequestTable
                        data={displayedPending}
                        isHistory={false}
                        currentPage={pendingPage}
                        itemsPerPage={itemsPerPage}
                        onProcessRequest={handleProcessRequest}
                        onDeleteHistory={handleDeleteHistory}
                    />
                }
                {totalPendingPages > 1 && (
                    <Pagination currentPage={pendingPage} totalPages={totalPendingPages} onPageChange={setPendingPage} />
                )}
            </div>

            {/* --- Phần lịch sử yêu cầu --- */}
            <div className="quynh-history-section">
                <h3>History</h3>
                {activeTab === 'changeShift'
                    ? renderChangeShiftTable(displayedHistory, true)
                    : <LeaveRequestTable
                        data={displayedHistory}
                        isHistory={true}
                        currentPage={historyPage}
                        itemsPerPage={itemsPerPage}
                        onProcessRequest={handleProcessRequest}
                        onDeleteHistory={handleDeleteHistory}
                    />
                }
                {totalHistoryPages > 1 && (
                    <Pagination currentPage={historyPage} totalPages={totalHistoryPages} onPageChange={setHistoryPage} />
                )}
            </div>
        </div>
    );
}