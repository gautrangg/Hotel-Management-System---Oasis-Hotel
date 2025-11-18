import React, { useEffect, useState, useCallback, useMemo } from "react";
import Pagination from "@components/base/ui/Pagination";
import ChangeShiftModal from "@components/base/form/ChangeShiftModal";
import LeaveRequestModal from "@components/base/form/LeaveRequestModal";
import EditChangeShiftModal from "@components/base/form/EditRequestChangeShift";
import EditLeaveRequestModal from "@components/base/form/EditLeaveRequestModal";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";

export default function HistoryRequest() {
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [changeShiftRequests, setChangeShiftRequests] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);

    // --- STATE PHÂN TRANG ---
    const [changeShiftPage, setChangeShiftPage] = useState(1);
    const [leavePage, setLeavePage] = useState(1);
    const itemsPerPage = 5;

    // --- STATE QUẢN LÝ MODAL ---
    const [showChangeShiftModal, setShowChangeShiftModal] = useState(false);
    const [showLeaveRequestModal, setShowLeaveRequestModal] = useState(false);
    const [showEditChangeShiftModal, setShowEditChangeShiftModal] = useState(false);
    const [showEditLeaveModal, setShowEditLeaveModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // --- STATE LỌC DỮ LIỆU ---
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // --- STATE NGƯỜI DÙNG ---
    const [userInfo, setUserInfo] = useState(null);
    const token = localStorage.getItem("token");

    // --- GIẢI MÃ TOKEN LẤY THÔNG TIN USER ---
    useEffect(() => {
        if (token) {
            try {
                const decodedData = jwtDecode(token);
                setUserInfo(decodedData);
            } catch (error) {
                console.error("Invalid token:", error);
            }
        }
    }, [token]);

    // --- HÀM LẤY DỮ LIỆU TỪ API ---
    const fetchRequests = useCallback(async () => {
        if (!token) return;
        try {
            const [changeRes, leaveRes] = await Promise.all([
                fetch("http://localhost:8080/api/history-change-shift-requests", {
                    headers: { "Authorization": `Bearer ${token}` },
                }),
                fetch("http://localhost:8080/api/history-leave-requests", {
                    headers: { "Authorization": `Bearer ${token}` },
                }),
            ]);
            const changeData = await changeRes.json();
            const leaveData = await leaveRes.json();
            setChangeShiftRequests(changeData);
            setLeaveRequests(leaveData);
        } catch (err) {
            console.error("Error fetching requests:", err);
        }
    }, [token]);

    // --- GỌI API KHI COMPONENT MOUNT ---
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // --- RESET TRANG KHI TÌM KIẾM HOẶC LỌC ---
    useEffect(() => {
        setChangeShiftPage(1);
        setLeavePage(1);
    }, [searchTerm, dateFilter]);

    // --- LỌC DỮ LIỆU ĐỔI CA ---
    const filteredChangeShiftRequests = useMemo(() => {
        return changeShiftRequests.filter(req => {
            const matchesSearch = searchTerm
                ? (req.targetStaff?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    req.reason?.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;
            const matchesDate = dateFilter
                ? (() => {
                    const requestDate = new Date(req.requestAt);
                    const cutoffDate = new Date();
                    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateFilter));
                    return requestDate >= cutoffDate;
                })()
                : true;
            return matchesSearch && matchesDate;
        });
    }, [changeShiftRequests, searchTerm, dateFilter]);

    // --- LỌC DỮ LIỆU NGHỈ PHÉP ---
    const filteredLeaveRequests = useMemo(() => {
        return leaveRequests.filter(req => {
            const matchesSearch = searchTerm
                ? req.reason?.toLowerCase().includes(searchTerm.toLowerCase())
                : true;

            const matchesDate = dateFilter
                ? (() => {
                    const requestDate = new Date(req.requestAt);
                    const cutoffDate = new Date();
                    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateFilter));
                    return requestDate >= cutoffDate;
                })()
                : true;
            return matchesSearch && matchesDate;
        });
    }, [leaveRequests, searchTerm, dateFilter]);

    // --- XỬ LÝ MỞ / ĐÓNG MODAL CHỈNH SỬA ---
    const handleEditChangeClick = (request) => {
        setSelectedRequest(request);
        setShowEditChangeShiftModal(true);
    };
    const handleCloseEditModal = (request) => {
        setShowEditChangeShiftModal(false);
        setSelectedRequest(null);
    };
    const handleEditLeaveClick = (request) => {
        setSelectedRequest(request);
        setShowEditLeaveModal(true);
    };
    const handleCloseEditLeaveModal = () => {
        setShowEditLeaveModal(false);
        setSelectedRequest(null);
    };

    // --- HÀM XÓA YÊU CẦU ---
    const handleDeleteRequest = async (requestId) => {
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
        try {
            const res = await fetch(`http://localhost:8080/api/delete-schedule-requests/${requestId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                Swal.fire("Success", "Request deleted successfully!", "success");
                await fetchRequests(); // Reload danh sách sau khi xóa
            } else {
                const errorData = await res.json();
                Swal.fire("Error", `Failed to delete: ${errorData.message || "Unknown error"}`, "error");
            }
        } catch (error) {
            console.error("Error deleting request:", error);
            Swal.fire("Error", "An error occurred during deletion.", "error");
        }
    };

    // --- HÀM XỬ LÝ MÀU TRẠNG THÁI ---
    const getStatusColor = (status) => {
        if (status === "Pending") return "orange";
        if (status === "Approved") return "green";
        if (status === "Rejected") return "red";
        return "black";
    };

    // --- ĐỊNH DẠNG NGÀY GIỜ HIỂN THỊ ---
    const formatDateTime = (datetime) => {
        if (!datetime) return "";
        const date = new Date(datetime);
        return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };

    // --- TÍNH TOÁN PHÂN TRANG ---
    const totalChangeShiftPages = Math.ceil(filteredChangeShiftRequests.length / itemsPerPage); // tính tổng số trang và dùng hàm ceil để làm tròn lên
    const displayedChangeShiftRequests = filteredChangeShiftRequests.slice(
        (changeShiftPage - 1) * itemsPerPage, // tính start và end, -1 là do mảng bắt đầu từ 0
        changeShiftPage * itemsPerPage
    );

    const totalLeavePages = Math.ceil(filteredLeaveRequests.length / itemsPerPage);
    const displayedLeaveRequests = filteredLeaveRequests.slice(
        (leavePage - 1) * itemsPerPage,
        leavePage * itemsPerPage
    );

    return (
        <div className="quynh-history-request">
            {/* --- THANH CÔNG CỤ: GỬI YÊU CẦU MỚI --- */}
            <div className="quynh-toolbar">
                <button className="quynh-request-btn" onClick={() => setShowLeaveRequestModal(true)}>Request Leave</button>
                <button className="quynh-request-btn" onClick={() => setShowChangeShiftModal(true)}>Change shifts</button>
            </div>

            {/* --- BỘ LỌC TÌM KIẾM VÀ NGÀY --- */}
            <div className="quynh-filter-controls">
                <input
                    type="text"
                    placeholder="Search by Target Staff or Reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                >
                    <option value="">All Time</option>
                    <option value="1">Last 24 hours</option>
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                </select>
            </div>

            {/* --- BẢNG ĐỔI CA --- */}
            <h3>Change Shift Request</h3>
            <table className="quynh-custom-table">
                <thead>
                    <tr>
                        <th>ID</th><th>Date</th><th>Shift</th><th>Target Shift</th><th>Target Staff</th>
                        <th>Reason</th><th>Requested At</th><th>Status</th><th>Option</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedChangeShiftRequests.length > 0 ? (
                        displayedChangeShiftRequests.map((req, index) => (
                            <tr key={req.requestId}>
                                <td>{(changeShiftPage - 1) * itemsPerPage + index + 1}</td>
                                <td>{req.shiftDate}</td>
                                <td>{req.shift}</td>
                                <td>{req.targetShift}</td>
                                <td>{req.targetStaff}</td>
                                <td>{req.reason}</td>
                                <td>{formatDateTime(req.requestAt)}</td>
                                <td style={{ color: getStatusColor(req.status), fontWeight: "bold" }}>{req.status}</td>
                                <td>
                                    {req.status === "Pending" ? (
                                        <>
                                            <button className="quynh-orange-btn" onClick={() => handleEditChangeClick(req)}>Edit</button>
                                            <button className="quynh-delete-btn" onClick={() => handleDeleteRequest(req.requestId)}>Delete</button>
                                        </>
                                    ) : (
                                        <span style={{ color: "#999", fontStyle: "italic" }}>No options</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" style={{ textAlign: 'center' }}>No requests found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {totalChangeShiftPages > 1 && (
                <Pagination
                    currentPage={changeShiftPage}
                    totalPages={totalChangeShiftPages}
                    onPageChange={setChangeShiftPage}
                />
            )}

            {/* --- BẢNG NGHỈ PHÉP --- */}
            <h3>Leave Request</h3>
            <table className="quynh-custom-table">
                <thead>
                    <tr>
                        <th>ID</th><th>Date</th><th>Shift</th><th>Reason</th>
                        <th>Request At</th><th>Status</th><th>Option</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedLeaveRequests.length > 0 ? (
                        displayedLeaveRequests.map((req, index) => (
                            <tr key={req.requestId}>
                                <td>{(leavePage - 1) * itemsPerPage + index + 1}</td>
                                <td>{req.date}</td>
                                <td>{req.shift}</td>
                                <td>{req.reason}</td>
                                <td>{formatDateTime(req.requestAt)}</td>
                                <td style={{ color: getStatusColor(req.status), fontWeight: "bold" }}>{req.status}</td>
                                <td>
                                    {req.status === "Pending" ? (
                                        <>
                                            <button className="quynh-orange-btn" onClick={() => handleEditLeaveClick(req)}>Edit</button>
                                            <button className="quynh-delete-btn" onClick={() => handleDeleteRequest(req.requestId)}>Delete</button>
                                        </>
                                    ) : (
                                        <span style={{ color: "#999", fontStyle: "italic" }}>No options</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>No requests found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {totalLeavePages > 1 && (
                <Pagination
                    currentPage={leavePage}
                    totalPages={totalLeavePages}
                    onPageChange={setLeavePage}
                />
            )}

            {/* --- MODAL GỬI YÊU CẦU --- */}
            <ChangeShiftModal
                isOpen={showChangeShiftModal}
                onClose={() => setShowChangeShiftModal(false)}
                onSuccess={fetchRequests}
            />
            <LeaveRequestModal
                isOpen={showLeaveRequestModal}
                onClose={() => setShowLeaveRequestModal(false)}
                onSuccess={fetchRequests}
            />

            {/* --- MODAL CHỈNH SỬA --- */}
            <EditChangeShiftModal
                isOpen={showEditChangeShiftModal}
                onClose={handleCloseEditModal}
                requestData={selectedRequest}
                userInfo={userInfo}
                onSuccess={fetchRequests}
            />
            <EditLeaveRequestModal
                isOpen={showEditLeaveModal}
                onClose={handleCloseEditLeaveModal}
                requestData={selectedRequest}
                userInfo={userInfo}
                onSuccess={fetchRequests}
            />
        </div>
    );
}