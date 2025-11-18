import React, { useState, useEffect } from "react";
import "./EditRequestFormModal.css"; 
import Swal from "sweetalert2";

export default function EditLeaveRequestModal({ isOpen, onClose, requestData, userInfo, onSuccess }) {
    const [formData, setFormData] = useState({
        date: "",
        shift: "",
        reason: ""
    });
    const [myScheduleId, setMyScheduleId] = useState(null);

    useEffect(() => {
        if (isOpen && requestData) {
            const formattedDate = requestData.date ? requestData.date.split("T")[0] : "";
            setFormData({
                date: formattedDate,
                shift: requestData.shift || "",
                reason: requestData.reason || ""
            });
            setMyScheduleId(requestData.scheduleId || null);
        } else {
            setFormData({ date: "", shift: "", reason: "" });
            setMyScheduleId(null);
        }
    }, [isOpen, requestData]);

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        const token = localStorage.getItem("token");
        if (!userInfo) return;

        if (name === "date") {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                Swal.fire("Warning", "Cannot select a date in the past. Please select again!", "warning");
                setFormData((prev) => ({ ...prev, date: "", shift: "" }));
                return;
            }

            if (!value) return;

            try {
                const resMyShift = await fetch(`http://localhost:8080/api/shift?date=${value}&email=${userInfo.email}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const myShiftData = await resMyShift.json();
                setFormData((prev) => ({ ...prev, shift: myShiftData.shiftName || "Nothing" }));
                setMyScheduleId(myShiftData.scheduleId); 
            } catch (error) {
                console.error("Error fetching my shift:", error);
                setFormData((prev) => ({ ...prev, shift: "Nothing" }));
                setMyScheduleId(null);
            }
        }
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        if (!myScheduleId) {
            Swal.fire("Warning", "Your schedule information could not be found for the selected date. Please re-select the date.", "warning");
            return;
        }
        if (!formData.reason || formData.reason.trim() === "") {
            Swal.fire("Warning", "Please provide a reason for your leave request.", "warning");
            return;
        }

        const payload = {
            scheduleId: parseInt(myScheduleId, 10),
            reason: formData.reason,
        };

        try {
            const res = await fetch(`http://localhost:8080/api/edit-leave-requests/${requestData.requestId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                Swal.fire("Success", "Request updated successfully!", "success");
                onSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                console.error("Server responded with an error:", errorData);
                Swal.fire("Error", `Failed to update request: ${errorData.message || errorData.error || 'Unknown error'}`, "error");
            }
        } catch (error) {
            console.error("Error updating request:", error);
            Swal.fire("Error", "An error occurred while updating the request.", "error");
        }
    };

    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="quynh-modal-overlay">
            <div className="quynh-modal-content" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="quynh-modal-close">×</button>
                <h2 className="quynh-modal-header">Edit Leave Request</h2>

                <div>
                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Date of Leave</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="quynh-form-input" min={new Date().toISOString().split("T")[0]} />
                    </div>

                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Your Shift</label>
                        <input type="text" name="shift" value={formData.shift} readOnly placeholder="Select a date to see your shift" className="quynh-form-input" />
                    </div>

                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Reason</label>
                        <textarea name="reason" value={formData.reason} onChange={handleChange} className="quynh-form-textarea" />
                    </div>

                    <div className="quynh-form-buttons">
                        <button onClick={handleSubmit} className="quynh-btn quynh-btn-submit">Update Request</button>
                        <button onClick={onClose} className="quynh-btn quynh-btn-cancel">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}