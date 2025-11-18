import React, { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import "./LeaveRequest.css";
import Swal from "sweetalert2";

export default function LeaveRequestModal({ isOpen, onClose, onSuccess }) {
    //  State quản lý dữ liệu trong form xin nghỉ
    const [formData, setFormData] = useState({
        date: "",
        shift: "",
        reason: ""
    });

    //  Lưu thông tin người dùng giải mã từ token
    const [userInfo, setUserInfo] = useState(null);

    //  Lưu lại scheduleId (ca làm của nhân viên tại ngày chọn)
    const [scheduleId, setScheduleId] = useState(null);

    //  Khi modal mở: lấy token và giải mã để lấy thông tin nhân viên
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

    //  Xử lý thay đổi dữ liệu trong các input
    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        //  Khi người dùng chọn ngày
        if (name === "date") {

            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            //  Không cho phép chọn ngày trong quá khứ
            if (selectedDate < today) {
                Swal.fire("Warning", "Cannot select a date in the past. Please select again.!", "warning");
                setFormData((prev) => ({
                    date: "",
                    shift: "",
                    reason: ""
                }));
                onClose();
                return;
            }

            //  Nếu chưa có userInfo hoặc chưa chọn ngày thì thoát
            if (!userInfo || !value) return;

            //  Gọi API để lấy ca làm của người dùng tại ngày được chọn
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:8080/api/shift?date=${value}&email=${userInfo.email}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                //  Nếu lấy thành công thì hiển thị ca làm và scheduleId
                if (res.ok) {
                    const data = await res.json();
                    setFormData(prev => ({
                        ...prev,
                        shift: data.shiftName || "Nothing"
                    }));
                    setScheduleId(data.scheduleId);
                } else {
                    setFormData(prev => ({ ...prev, shift: "Nothing" }));
                    setScheduleId(null);
                }
            } catch (error) {
                console.error("Error fetching shift:", error);
                setFormData(prev => ({ ...prev, shift: "Nothing" }));
                setScheduleId(null);
            }
        }
    };

    //  Gửi yêu cầu xin nghỉ lên server
    const handleSubmit = async () => {
        const token = localStorage.getItem("token");

        //  Kiểm tra dữ liệu trước khi gửi
        if (!userInfo || !userInfo.staffId || !scheduleId || !formData.reason) {
            Swal.fire("Warning", "Please choose a date have a shift and your reason!", "warning");
            return;
        }

        try {
            //  Gửi request tạo yêu cầu xin nghỉ
            const res = await fetch("http://localhost:8080/api/schedule-requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    requesterStaffId: userInfo.staffId,
                    scheduleId: scheduleId,
                    requestType: "Leave",
                    reason: formData.reason
                })
            });

            //  Thông báo kết quả gửi yêu cầu
            if (res.ok) {
                Swal.fire("Success", "Leave request sent successfully!", "success");
                setFormData({
                    date: "",
                    shift: "",
                    reason: ""
                });
                onSuccess();
                onClose();

            } else {
                const errorData = await res.json();
                Swal.fire("Error", `Request sent failed: ${errorData.error || 'Unknown error'}`, "error");
            }
        } catch (error) {
            console.error("Error submitting leave request:", error);
            Swal.fire("Error", "An error occurred while sending the request.", "error");
        }
    };

    //  Nếu modal đóng thì không hiển thị gì
    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="quynh-modal-overlay">
            <div className="quynh-modal-content" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="quynh-modal-close">
                    &times;
                </button>

                <h2 className="quynh-modal-header">Request Leave</h2>

                {/* 🔹 Form nhập thông tin xin nghỉ */}
                <div>
                    {/* Chọn ngày nghỉ */}
                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Choose Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="quynh-form-input"
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    {/* Hiển thị ca làm hiện tại */}
                    <div className="quynh-form-group">
                        <label className="quynh-form-label">Shift</label>
                        <input
                            type="text"
                            name="shift"
                            value={formData.shift}
                            placeholder="Your shift will appear here"
                            readOnly
                            className="quynh-form-input"
                        />
                    </div>

                    {/* Nhập lý do xin nghỉ */}
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

                    {/* Các nút hành động */}
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