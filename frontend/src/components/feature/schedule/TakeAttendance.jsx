import React, { useState, useEffect } from "react";
import "@assets/schedule/TakeAttendance.css";
import Swal from "sweetalert2";

export default function TakeAttendance({ staffList, date, shiftName, shiftId, onClose, onSaveSuccess }) {
    const [attendance, setAttendance] = useState({});

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const initialAttendance = {};
        staffList.forEach((staff) => {
            const validStatus = ["On time", "Late", "Absent"];
            initialAttendance[staff.staffId] = validStatus.includes(staff.status)
                ? staff.status
                : "Absent";
        });
        setAttendance(initialAttendance);
    }, [staffList]);

    const handleChange = (id, value) => {
        setAttendance((prev) => ({ ...prev, [id]: value }));
    };

    const handleSave = async () => {
        console.log("Attendance to be submitted:", attendance);

        const payload = {
            shiftId: shiftId,
            workDate: date,
            attendance: attendance,
        };

        try {
            const response = await fetch('http://localhost:8080/api/schedules/attendance', {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update attendance.");
            }

            const result = await response.json();
            console.log("Server response:", result);
            await Swal.fire({
                icon: "success",
                title: "Success",
                text: result.message || "Attendance updated successfully!",
                timer: 1500,
                showConfirmButton: false,
            });
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving attendance:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "Failed to update attendance.",
            });
        }
    };

    const groupedStaffs = staffList.reduce((groups, staff) => {
        if (!groups[staff.roleName]) groups[staff.roleName] = [];
        groups[staff.roleName].push(staff);
        return groups;
    }, {});

    return (
        <>
            <div className="t-schedule-sidebar-container">
                <button className="t-attendance-close-btn" onClick={onClose}>
                    ✖
                </button>

                <h2 className="t-attendance-title">
                    Attendance Shift: {shiftName.split("(")[0]} {date}
                </h2>

                <div className="t-attendance-list">
                    {Object.keys(groupedStaffs).map((role) => (
                        <div key={role} className="t-attendance-role-group">
                            <h3>{role}</h3>

                            {groupedStaffs[role].map((s) => {
                                const status = attendance[s.staffId];
                                return (
                                    <div
                                        key={s.staffId}
                                        className={`t-attendance-card ${status === "On time"
                                            ? "on-time"
                                            : status === "Late"
                                                ? "late"
                                                : status === "Absent"
                                                    ? "absent"
                                                    : ""
                                            }`}
                                    >
                                        <div className="t-attendance-info">
                                            <div className="t-attendance-avatar">
                                                <img
                                                    src={`http://localhost:8080/upload/avatar/${s.staffImage}`}
                                                    alt={s.fullName}
                                                />
                                            </div>
                                            <div className="t-attendance-text">
                                                <strong>{s.fullName}</strong>
                                                <p>{s.email}</p>
                                            </div>
                                        </div>

                                        <div className="t-attendance-options">
                                            {["On time", "Late", "Absent"].map((opt) => (
                                                <label key={opt}>
                                                    <input
                                                        type="radio"
                                                        name={`attendance-${s.staffId}`}
                                                        checked={attendance[s.staffId] === opt}
                                                        onChange={() => handleChange(s.staffId, opt)}
                                                    />
                                                    {opt}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <button className="t-attendance-save-btn" onClick={handleSave}>
                    Save
                </button>
            </div>
        </>
    );
}
