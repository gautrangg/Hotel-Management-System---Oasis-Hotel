import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

import "@assets/schedule/ScheduleDetail.css";

import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";

import TakeAttendance from "@components/feature/schedule/TakeAttendance";
import AddStaffToShift from "@components/feature/schedule/AddStaffToShift";
import Pagination from "@components/base/ui/Pagination";

export default function ScheduleDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const date = params.get("date");
    const shiftId = params.get("shift");

    const [staffList, setStaffList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    const [cancelable, setCancelable] = useState(false);

    const [showOverlay, setShowOverlay] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showAddStaff, setShowAddStaff] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(20);

    const fetchStaffList = () => {
        fetch(`http://localhost:8080/api/schedules/detail?shiftId=${shiftId}&date=${date}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(setStaffList)
            .catch((err) => console.error("Error fetching schedule detail:", err));
    };

    useEffect(() => {
        fetchStaffList();
    }, [shiftId, date]);

    const handleCancelSchedule = async (scheduleId) => {
        const result = await Swal.fire({
            title: "Cancel Schedule?",
            text: "Are you sure you want to cancel this schedule?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, cancel it",
            cancelButtonText: "No, keep it",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        });

        if (!result.isConfirmed) return;


        try {
            const res = await fetch("http://localhost:8080/api/schedules/cancel", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ scheduleId }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            if (data.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Schedule cancelled successfully!",
                    showConfirmButton: false,
                    timer: 1000,
                });

                fetchStaffList();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to cancel schedule",
                    text: data.message || "Unknown error occurred.",
                });
            }
        } catch (err) {
            console.error("Cancel schedule failed:", err);
            Swal.fire({
                icon: "error",
                title: "Error cancelling schedule",
                text: err.message,
            });
        }
    };


    const getStatusClass = (status) => {
        switch (status) {
            case "On time": return "t-schedule-detail-status-on";
            case "Late": return "t-schedule-detail-status-late";
            case "Absent": return "t-schedule-detail-status-absent";
            default: return "t-schedule-detail-status-pending";
        }
    };

    const getShiftName = (id) => {
        switch (String(id)) {
            case "1": return "Night Shift (00:00 - 08:00)";
            case "2": return "Morning Shift (08:00 - 16:00)";
            case "3": return "Evening Shift (16:00 - 00:00)";
            default: return "Unknown Shift";
        }
    };

    const filteredStaffs = staffList.filter((s) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            (s.fullName ?? "").toLowerCase().includes(term) ||
            (s.phone ?? "").toLowerCase().includes(term) ||
            (s.email ?? "").toLowerCase().includes(term);
        const matchesRole =
            !selectedRole || s.roleName === selectedRole;
        return matchesSearch && matchesRole;
    });

    const diffDays = Math.floor(
        (new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0))
        / 86400000
    );

    const openAttendance = () => {
        setShowOverlay(true);
        setTimeout(() => setShowSidebar(true), 10);
    };

    const closeAttendance = () => {
        setShowSidebar(false);
        setTimeout(() => setShowOverlay(false), 300);
    };

    const openAddStaff = () => {
        setShowOverlay(true);
        setTimeout(() => setShowAddStaff(true), 10);
    };

    const closeAddStaff = () => {
        setShowAddStaff(false);
        setTimeout(() => setShowOverlay(false), 300);
    };


    let actionButton = null;
    if (diffDays === 0 || diffDays === -1) {
        actionButton = (<>
            <button
                className="t-schedule-detail-add-btn"
                onClick={openAttendance}
            >
                Schedule Status
            </button>
            <button
                className="t-schedule-detail-add-btn"
                onClick={openAddStaff}
            >
                Add Staff to this Shift
            </button>
        </>
        );
    } else if (diffDays >= 3 && diffDays > 0) {
        actionButton = (
            <button
                className="t-schedule-detail-add-btn"
                onClick={openAddStaff}
            >
                Add Staff to this Shift
            </button>
        );
    }

    useEffect(() => {
        if (diffDays >= 3 && diffDays > 0) setCancelable(true);
        else setCancelable(false);
    }, [diffDays]);

    const totalPages = Math.ceil(filteredStaffs.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const currentStaffs = filteredStaffs.slice(startIndex, endIndex);


    return (
        <div className="staff-dashboard">
            <Header />
            <Sidebar />
            <div className="staff-main-content">
                <div className="t-schedule-detail-container">
                    <div className="t-schedule-detail-back" onClick={() => navigate(-1)}>
                        <span className="t-schedule-detail-back-icon">
                            <i className="bx bx-arrow-back"></i>
                        </span> Back
                    </div>

                    <div className="t-schedule-detail-header">
                        <h2 className="t-schedule-detail-title">
                            {getShiftName(shiftId)} — {date}
                        </h2>
                    </div>

                    {/* Filter + Search */}
                    <div className="t-schedule-detail-filters">
                        <select
                            className="t-schedule-detail-role-filter"
                            value={selectedRole}
                            onChange={(e) => {
                                setSelectedRole(e.target.value);
                            }}
                        >
                            <option value="">All Roles</option>
                            <option value="Receptionist">Receptionist</option>
                            <option value="Housekeeper">Housekeeping</option>
                            <option value="Service Staff">Service Staff</option>
                        </select>
                        <input type="text"
                            className="t-schedule-detail-search"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                            }}
                        />
                        <button className="t-schedule-detail-search-btn">Search</button>

                        {actionButton}
                    </div>

                    <div className="t-schedule-detail-table-container">
                        <table className="t-schedule-detail-table">
                            <thead>
                                <tr>
                                    <th>Staff</th>
                                    <th>Citizen ID</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentStaffs.map((s) => (
                                    <tr key={s.staffId}>
                                        <td className="t-schedule-detail-staff">
                                            <img
                                                src={`http://localhost:8080/upload/avatar/${s.staffImage}`}
                                                className="t-schedule-detail-avatar"
                                            />

                                            <span>
                                                <strong>{s.fullName}</strong>
                                                <br></br>
                                                {s.email} </span>
                                        </td>
                                        <td>{s.citizenId}</td>
                                        <td>{s.phone}</td>
                                        <td>{s.roleName}</td>
                                        <td>
                                            <span className={`t-schedule-detail-status ${getStatusClass(s.status)}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        {cancelable ?
                                            <td className="t-schedule-detail-remove">
                                                <i className="bx bx-minus-circle"
                                                    onClick={() => handleCancelSchedule(s.scheduleId)}
                                                    style={{ cursor: "pointer", color: "red" }}
                                                    title="Cancel this schedule"></i>
                                            </td> :
                                            <p></p>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="table-footer">
                    <div className="records-per-page">
                        <span>Show:</span>
                        <select value={recordsPerPage} onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
            {/* Overlay + Sidebar animation */}
            {showOverlay && (
                <div
                    className="t-attendance-overlay show"
                    onClick={showSidebar ? closeAttendance : closeAddStaff}
                >
                    <div
                        className={`t-schedule-sidebar ${showSidebar ? "open" : ""}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {showSidebar && (
                            <TakeAttendance
                                staffList={staffList}
                                date={date}
                                shiftName={getShiftName(shiftId)}
                                shiftId={shiftId}
                                onClose={closeAttendance}
                                onSaveSuccess={fetchStaffList}
                            />
                        )}
                    </div>

                    <div
                        className={`t-schedule-sidebar ${showAddStaff ? "open" : ""}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {showAddStaff && (
                            <AddStaffToShift
                                date={date}
                                shiftId={shiftId}
                                shiftName={getShiftName(shiftId)}
                                onClose={closeAddStaff}
                                onAddSuccess={fetchStaffList}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
