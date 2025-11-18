import React, { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import "./EditRequestFormModal.css";
import Swal from "sweetalert2";

export default function ChangeShiftModal({ isOpen, onClose, onSuccess }) {
    // --- STATE QUẢN LÝ FORM ---
    const [formData, setFormData] = useState({
        date: "",
        shift: "",
        targetStaff: "",
        newShiftEquivalent: "",
        reason: ""
    });

    // --- DANH SÁCH NHÂN VIÊN CÓ CA TRONG NGÀY ĐÃ CHỌN ---
    const [staffList, setStaffList] = useState([]);

    // --- ID CA LÀM CỦA NGƯỜI GỬI YÊU CẦU ---
    const [myScheduleId, setMyScheduleId] = useState(null);

    // --- THÔNG TIN USER LẤY TỪ TOKEN ---
    const [userInfo, setUserInfo] = useState(null);

    // --- GIẢI MÃ TOKEN MỖI KHI MỞ MODAL ---
    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const decodedData = jwtDecode(token);
                    setUserInfo(decodedData);
                } catch (error) {
                    console.error("Invalid token:", error);
                    setUserInfo(null);
                }
            }
        }
    }, [isOpen]);

    // --- XỬ LÝ KHI NGƯỜI DÙNG NHẬP DỮ LIỆU ---
    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        const token = localStorage.getItem("token");
        if (!userInfo) return;

        // Khi chọn ngày
        if (name === "date") {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // --- Không cho phép chọn ngày trong quá khứ ---
            if (selectedDate < today) {
                Swal.fire("Warning", "Cannot select a date in the past. Please select again!", "warning");
                setFormData({
                    date: "",
                    shift: "",
                    targetStaff: "",
                    newShiftEquivalent: "",
                    reason: ""
                });
                onClose();
                return;
            }

            if (!value) return;

            let myShiftData

            // --- GỌI API: Lấy ca làm của bản thân trong ngày được chọn ---
            try {
                const resMyShift = await fetch(
                    `http://localhost:8080/api/shift?date=${value}&email=${userInfo.email}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                myShiftData = await resMyShift.json();
                setFormData((prev) => ({
                    ...prev,
                    shift: myShiftData.shiftName || "Nothing"
                }));
                setMyScheduleId(myShiftData.scheduleId);
            } catch (error) {
                console.error("Error fetching my shift:", error);
                setFormData((prev) => ({ ...prev, shift: "Nothing" }));
            }
            const currentShiftName = myShiftData.shiftName || "Nothing";
            // --- GỌI API: Lấy danh sách nhân viên khác có ca làm trong ngày đó ---
            try {
                const token = localStorage.getItem("token");
                const staffRole = jwtDecode(token).role;
                console.log("Sit name: " + currentShiftName);
                const resStaff = await fetch(
                    `http://localhost:8080/api/staff-shift?date=${value}&role=${staffRole}&shift=${currentShiftName}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const staffData = await resStaff.json();
                setStaffList(staffData);
            } catch (error) {
                console.error("Error fetching staff list:", error);
                setStaffList([]);
            }
            // --- Reset thông tin khi đổi ngày ---
            setFormData((prev) => ({
                ...prev,
                targetStaff: "",
                newShiftEquivalent: ""
            }));
        }

        //  Khi chọn nhân viên muốn đổi ca cùng
        if (name === "targetStaff") {
            const selectedStaff = staffList.find(
                (staff) => staff.staffId.toString() === value
            );

            if (selectedStaff) {
                try {
                    const resShift = await fetch(
                        `http://localhost:8080/api/shift?date=${formData.date}&email=${selectedStaff.email}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const shiftData = await resShift.json();
                    setFormData((prev) => ({
                        ...prev,
                        newShiftEquivalent: shiftData.shiftName || "Nothing"
                    }));
                } catch (error) {
                    console.error("Error fetching selected staff shift:", error);
                    setFormData((prev) => ({ ...prev, newShiftEquivalent: "Nothing" }));
                }
            } else {
                setFormData((prev) => ({ ...prev, newShiftEquivalent: "" }));
            }
        }
    };

    // --- GỬI YÊU CẦU ĐỔI CA ---
    const handleSubmit = async () => {
        const token = localStorage.getItem("token");

        if (!userInfo || !userInfo.staffId || !myScheduleId || !formData.targetStaff) {
            Swal.fire("Warning", "Please fill in all required fields correctly.", "warning");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/schedule-requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    requesterStaffId: userInfo.staffId,
                    acceptingStaffId: formData.targetStaff,
                    scheduleId: myScheduleId,
                    requestType: "Change",
                    reason: formData.reason
                })
            });

            if (res.ok) {
                Swal.fire("Success", "Request submitted successfully!", "success");
                setFormData({
                    date: "",
                    shift: "",
                    reason: ""
                });
                onSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                Swal.fire("Error", `Failed to submit request: ${errorData.error || "Unknown error"}`, "error");
            }
        } catch (error) {
            console.error("Error submitting request:", error);
            Swal.fire("Error", "An error occurred while submitting the request.", "error");
        }
    };

    if (!isOpen) return null;

    // --- GIAO DIỆN MODAL FORM ---
    return (
        <div onClick={onClose} className="quynh-modal-overlay">
            <div className="quynh-modal-content" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="quynh-modal-close">&times;</button>

                <h2 className="quynh-modal-header">Request to change shifts</h2>

                <div>
                    {/* Ngày muốn đổi ca */}
                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Date Change</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="quynh-form-input"
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    {/* Ca hiện tại của bản thân */}
                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Your Current Shift</label>
                        <input
                            type="text"
                            name="shift"
                            value={formData.shift}
                            readOnly
                            placeholder="Your shift will appear here"
                            className="quynh-form-input"
                        />
                    </div>

                    {/* Chọn nhân viên muốn đổi ca */}
                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Select Staff to Swap With</label>
                        <select
                            name="targetStaff"
                            value={formData.targetStaff}
                            onChange={handleChange}
                            className="quynh-form-select"
                        >
                            <option value="">-- Select a staff member --</option>
                            {staffList.map((staff) => (
                                <option key={staff.staffId} value={staff.staffId}>
                                    {staff.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Ca của người được chọn */}
                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Their Shift</label>
                        <input
                            type="text"
                            name="newShiftEquivalent"
                            value={formData.newShiftEquivalent}
                            readOnly
                            placeholder="Their shift will appear here"
                            className="quynh-form-input"
                        />
                    </div>

                    {/* Lý do đổi ca */}
                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Reason</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            className="quynh-form-textarea"
                            required
                        />
                    </div>

                    {/* Nút hành động */}
                    <div className="quynh-form-buttons">
                        <button onClick={handleSubmit} className="quynh-btn quynh-btn-submit">
                            Send Request
                        </button>
                        <button onClick={onClose} className="quynh-btn quynh-btn-cancel">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}