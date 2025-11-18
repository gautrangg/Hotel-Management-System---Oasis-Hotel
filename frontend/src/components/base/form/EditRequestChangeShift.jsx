import React, { useState, useEffect } from "react";
import "./EditRequestFormModal.css";
import Swal from "sweetalert2";

export default function EditRequestChangeShiftModal({ isOpen, onClose, requestData, userInfo, onSuccess }) {

    // State lưu dữ liệu trong form chỉnh sửa yêu cầu đổi ca
    const [formData, setFormData] = useState({
        date: "",
        shift: "",
        targetStaff: "",
        newShiftEquivalent: "",
        reason: ""
    });

    // Danh sách nhân viên và scheduleId của người đang đăng nhập
    const [staffList, setStaffList] = useState([]);
    const [myScheduleId, setMyScheduleId] = useState(null);

    // Khi mở modal, lấy dữ liệu yêu cầu đổi ca và danh sách nhân viên có lịch trong ngày đó
    useEffect(() => {
        if (isOpen && requestData && userInfo) {
            console.log("Modal received scheduleId:", requestData.scheduleId);
            const token = localStorage.getItem("token");
            const formattedDate = requestData.shiftDate ? requestData.shiftDate.split("T")[0] : "";

            // Gán dữ liệu từ requestData vào form
            setFormData({
                date: formattedDate,
                shift: requestData.shift || "",
                targetStaff: requestData.targetStaffId || "",
                newShiftEquivalent: requestData.targetShift || "",
                reason: requestData.reason || ""
            });

            setMyScheduleId(requestData.scheduleId || null);

            // Hàm lấy danh sách nhân viên theo ngày
            const fetchInitialStaffList = async () => {
                if (!formattedDate) return;
                try {
                    const currentShiftName = requestData.shift;
                    const staffRole = userInfo.role;
                    const resStaff = await fetch(
                        `http://localhost:8080/api/staff-shift?date=${formattedDate}&role=${staffRole}&shift=${currentShiftName}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!resStaff.ok) throw new Error('Failed to fetch staff list');
                    const staffData = await resStaff.json();
                    // Loại bỏ người đang đăng nhập khỏi danh sách
                    const filteredStaff = staffData.filter(staff => staff.email !== userInfo.email);
                    setStaffList(filteredStaff);
                } catch (error) {
                    console.error("Error fetching initial staff list:", error);
                    setStaffList([]);
                }
            };

            fetchInitialStaffList();
        } else {
            // Reset dữ liệu khi modal đóng hoặc không có dữ liệu
            setFormData({ date: "", shift: "", targetStaff: "", newShiftEquivalent: "", reason: "" });
            setStaffList([]);
            setMyScheduleId(null);
        }
    }, [isOpen, requestData, userInfo]);

    // Xử lý khi người dùng thay đổi giá trị trong form
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

            // --- GỌI API: Lấy ca làm của bản thân trong ngày được chọn ---
            try {
                const resMyShift = await fetch(
                    `http://localhost:8080/api/shift?date=${value}&email=${userInfo.email}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const myShiftData = await resMyShift.json();
                setFormData((prev) => ({
                    ...prev,
                    shift: myShiftData.shiftName || "Nothing"
                }));
                setMyScheduleId(myShiftData.scheduleId);
            } catch (error) {
                console.error("Error fetching my shift:", error);
                setFormData((prev) => ({ ...prev, shift: "Nothing" }));
            }
            // --- GỌI API: Lấy danh sách nhân viên khác có ca làm trong ngày đó ---
            try {
                const currentShiftName = requestData.shift;
                const staffRole = userInfo.role;
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

    // Xử lý gửi yêu cầu cập nhật đổi ca lên server
    const handleSubmit = async () => {
        const token = localStorage.getItem("token");

        // Kiểm tra dữ liệu trước khi gửi
        if (!formData.targetStaff) {
            Swal.fire("Warning", "Please select a target staff.", "warning");
            return;
        }
        if (!myScheduleId) {
            Swal.fire("Warning", "Your schedule information could not be found for the selected date. Please re-select the date.", "warning");
            return;
        }

        // Chuẩn bị dữ liệu gửi lên server
        const payload = {
            targetStaffId: parseInt(formData.targetStaff, 10),
            scheduleId: parseInt(myScheduleId, 10),
            reason: formData.reason
        };

        console.log("Sending payload:", payload);
        try {
            const res = await fetch(`http://localhost:8080/api/edit-schedule-requests/${requestData.requestId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            // Nếu cập nhật thành công
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

    // Nếu modal đang đóng thì không hiển thị
    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="quynh-modal-overlay">
            <div className="quynh-modal-content" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="quynh-modal-close">×</button>
                <h2 className="quynh-modal-header">Edit Request to Change Shift</h2>

                {/* Form chỉnh sửa yêu cầu đổi ca */}
                <div>
                    {/* Chọn ngày muốn đổi */}
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

                    {/* Hiển thị ca làm hiện tại của người dùng */}
                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Your Current Shift</label>
                        <input
                            type="text"
                            name="shift"
                            value={formData.shift}
                            readOnly
                            placeholder="Select a date to see your shift"
                            className="quynh-form-input"
                        />
                    </div>

                    {/* Chọn nhân viên muốn đổi ca cùng */}
                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Select the staff you want to change with</label>
                        <select
                            name="targetStaff"
                            value={formData.targetStaff}
                            onChange={handleChange}
                            className="quynh-form-select"
                        >
                            <option value="">-- Select Target Staff --</option>
                            {staffList.map((staff) => (
                                <option key={staff.staffId} value={staff.staffId}>
                                    {staff.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Hiển thị ca làm của nhân viên được chọn */}
                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Target Staff's Shift</label>
                        <input
                            type="text"
                            name="newShiftEquivalent"
                            value={formData.newShiftEquivalent}
                            readOnly
                            placeholder="Select a staff member to see their shift"
                            className="quynh-form-input"
                        />
                    </div>

                    {/* Nhập lý do đổi ca */}
                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Reason</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            className="quynh-form-textarea"
                        />
                    </div>

                    {/* Nút hành động */}
                    <div className="quynh-form-buttons">
                        <button onClick={handleSubmit} className="quynh-btn quynh-btn-submit">
                            Update Request
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