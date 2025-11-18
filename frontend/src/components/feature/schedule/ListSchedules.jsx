import React, { useState, useEffect,useRef } from "react";
import jwtDecode from "jwt-decode";
import HistoryRequest from "@components/feature/schedule/HistoryRequest";
import ChangeShiftModal from "@components/base/form/ChangeShiftModal";
import LeaveRequestModal from "@components/base/form/LeaveRequestModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


// Trả về Date (UTC midnight) của thứ Hai trong tuần chứa `d`
function getMonday(d) {
    if (!d) d = new Date(); 
    const src = (d instanceof Date) ? d : new Date(d);
    const y = src.getUTCFullYear();
    const m = src.getUTCMonth();
    const date = src.getUTCDate();
    const weekday = (new Date(Date.UTC(y, m, date)).getUTCDay() + 6) % 7; //tinh khoang cach cua hom nay voi thu 2
    const mondayUtc = new Date(Date.UTC(y, m, date - weekday));
    return mondayUtc;
}

// Tạo danh sách 7 ngày, bắt đầu từ thứ Hai.
function getWeekDates(monday) {
    const week = [];
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const base = getMonday(monday);


    for (let i = 0; i < 7; i++) {
        const dUtc = new Date(Date.UTC(
            base.getUTCFullYear(),
            base.getUTCMonth(),
            base.getUTCDate() + i // +i để lấy ngày trong tuần bắt đầu từ ngày của base
        ));
        const y = dUtc.getUTCFullYear();
        const mm = String(dUtc.getUTCMonth() + 1).padStart(2, "0"); // target lenght = 2, 5 -> 05
        const dd = String(dUtc.getUTCDate()).padStart(2, "0");
        const ymd = `${y}-${mm}-${dd}`;

        week.push({
            day: daysOfWeek[i],
            date: dUtc.getUTCDate(),
            fullDate: dUtc,
            ymd
        });
    }
    return week;
}


//  Tạo danh sách các tùy chọn tuần (4 tuần trước và 4 tuần sau)
function generateWeekOptions(pastWeeks = 4, futureWeeks = 4) {
    const options = [];
    const today = new Date();
    for (let i = pastWeeks; i > 0; i--) {
        const monday = getMonday(new Date(today.getFullYear(), today.getMonth(), today.getDate() - i * 7));
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        const label = `${monday.getDate().toString().padStart(2, '0')}-${(monday.getMonth() + 1).toString().padStart(2, '0')}-${monday.getFullYear()} to ${sunday.getDate().toString().padStart(2, '0')}-${(sunday.getMonth() + 1).toString().padStart(2, '0')}-${sunday.getFullYear()}`;
        options.push({ label, monday });
    }
    for (let i = 0; i <= futureWeeks; i++) {
        const monday = getMonday(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i * 7));
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        const label = `${monday.getDate().toString().padStart(2, '0')}-${(monday.getMonth() + 1).toString().padStart(2, '0')}-${monday.getFullYear()} to ${sunday.getDate().toString().padStart(2, '0')}-${(sunday.getMonth() + 1).toString().padStart(2, '0')}-${sunday.getFullYear()}`;
        options.push({ label, monday });
    }
    return options;
}

export default function ListSchedules() {
    //  Quản lý tab hiện tại ("mySchedule" hoặc "historyRequest")
    const [activeTab, setActiveTab] = useState("mySchedule");

    //  Tạo danh sách tuần và chọn tuần hiện tại
    const weekOptions = generateWeekOptions(4, 4);
    const currentMonday = getMonday(new Date());
    const token = localStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const staffId = decoded?.staffId || decoded?.id;
    const defaultWeek = weekOptions.find(w => w.monday.getTime() === currentMonday.getTime()) || weekOptions[0]; // lấy ra tuần này, nếu ko có thì lấy tuần đầu tiên trong mảng

    //  State quản lý tuần, ngày, ca làm và modal
    const [selectedWeek, setSelectedWeek] = useState(defaultWeek.monday);
    const [days, setDays] = useState(getWeekDates(defaultWeek.monday));
    const [assignedShifts, setAssignedShifts] = useState([]);
    const [showChangeShiftModal, setShowChangeShiftModal] = useState(false);
    const [showLeaveRequestModal, setShowLeaveRequestModal] = useState(false);
    const [requestVersion, setRequestVersion] = useState(0);

    //  Danh sách các ca làm việc cố định
    const shifts = [
        { id: 1, name: "Night", time: "00h00 - 08h00" },
        { id: 2, name: "Morning", time: "08h00 - 16h00" },
        { id: 3, name: "Evening", time: "16h00 - 24h00" }
    ];

    //  Tìm thông tin ca làm cụ thể của nhân viên trong ngày tương ứng
    const getShiftDetails = (day, shiftName) => {
        return assignedShifts.find(s => {
            const shiftDate = new Date(s.workDate);
            const currentShift = shifts.find(sh => sh.name === shiftName);

            return s.shift?.shiftId === currentShift?.id &&
                shiftDate.getFullYear() === day.fullDate.getFullYear() &&
                shiftDate.getMonth() === day.fullDate.getMonth() &&
                shiftDate.getDate() === day.fullDate.getDate();
        });
    };

    //  Khi chọn tuần mới: tải dữ liệu ca làm từ API
    useEffect(() => {
        setDays(getWeekDates(selectedWeek));
        const fetchSchedules = async () => {
            const from = selectedWeek.toISOString().split("T")[0];
            const to = new Date(selectedWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // Cộng thêm số mls của 6 ngày tiếp theo để ra chủ nhật
            try {
                const res = await fetch(`http://localhost:8080/api/schedules/${staffId}?from=${from}&to=${to}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
                const data = await res.json();
                setAssignedShifts(data);
            } catch (err) {
                console.error("Error fetching schedules:", err);
            }
        };
        if (staffId) {
            fetchSchedules();
        }
    }, [selectedWeek, staffId, token]);

    //  Callback khi gửi yêu cầu (đổi ca hoặc nghỉ) thành công
    const handleRequestSuccess = () => {
        setShowChangeShiftModal(false);
        setShowLeaveRequestModal(false);
        setRequestVersion(currentVersion => currentVersion + 1); // để cho useEffect chạy
        setActiveTab("historyRequest");
    };

    //  Xuất lịch làm việc ra file Excel
    const handleExportExcel = () => {
        // không có data
        if (assignedShifts.length <= 0) {
            Swal.fire({
                icon: "warning",
                title: "No data to export!",
                confirmButtonText: "OK"
            });
            return;
        }


        const monthName = selectedWeek.toLocaleString("en-US", { month: "long" }); // Lấy tên đầy đủ bằng tiếng anh
        const year = selectedWeek.getFullYear();
        const headerTitle = [`Schedule for ${monthName} ${year}`];
        const headerRow = ["Shift / Date", ...days.map(d => `${d.day} ${d.date}`)]; // spread operator, chuyển thành các phần tử trong mảng

        const rows = shifts.map(shift => {
            const row = [shift.name];
            days.forEach(d => {
                const shiftDetails = getShiftDetails(d, shift.name);
                row.push(shiftDetails ? shiftDetails.status : "--");
            });
            return row;
        });

        const worksheetData = [headerTitle, [], headerRow, ...rows]; // tạo mảng 2 chiều

        //  Tạo và lưu file Excel
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData); // chuyển mảng 2 chiều thành worksheet
        const workbook = XLSX.utils.book_new(); // tạo workbook mới
        XLSX.utils.book_append_sheet(workbook, worksheet, "My Schedule");  // thêm workshet vào workbok
        const fileName = `Schedule_${monthName}_${year}.xlsx`;
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" }); // xuất workbook thành mảng byte
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" }); // chuyển thành file có thể download
        saveAs(blob, fileName); // dùng tvien FileSave.js để down về máy
    };

    //  Chuyển tab sang "HistoryRequest" khi có yêu cầu mới được gửi
    const prevVersion = useRef(requestVersion);
    useEffect(() => {
        if (requestVersion !== prevVersion.current) {
            prevVersion.current = requestVersion;
            setActiveTab("historyRequest");
        }
    }, [requestVersion]);


    return (
        <div className="quynh-schedule-container">
            {/*  Thanh chuyển đổi giữa "Lịch làm" và "Lịch sử yêu cầu" */}
            <div className="quynh-schedule-tabs">
                <button className={activeTab === "mySchedule" ? "quynh-tab-btn quynh-active" : "quynh-tab-btn"} onClick={() => setActiveTab("mySchedule")}>
                    My Schedule
                </button>
                <button className={activeTab === "historyRequest" ? "quynh-tab-btn quynh-active" : "quynh-tab-btn"} onClick={() => setActiveTab("historyRequest")}>
                    History Request
                </button>
            </div>

            {/*  Hiển thị bảng lịch làm việc của tuần được chọn */}
            {activeTab === "mySchedule" && (
                <div className="quynh-schedule-toolbar">
                    <div className="quynh-toolbar-left">
                        <h2 className="quynh-toolbar-title">{selectedWeek.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h2>
                        <select
                            className="quynh-week-select"
                            value={selectedWeek.toISOString()}
                            onChange={(e) => setSelectedWeek(new Date(e.target.value))}
                        >
                            {weekOptions.map((w, idx) => (
                                <option key={idx} value={w.monday.toISOString()}>{w.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="quynh-toolbar-right">
                        <button className="quynh-request-btn" onClick={() => setShowLeaveRequestModal(true)}>Request Leave</button>
                        <button className="quynh-request-btn" onClick={() => setShowChangeShiftModal(true)}>Change shifts</button>
                        <button className="quynh-export-btn" onClick={handleExportExcel}>Export Excel</button>
                    </div>

                </div>
            )}

            {/*  Bảng lịch làm việc chi tiết từng ngày và từng ca */}
            {activeTab === "mySchedule" && (
                <div className="quynh-schedule-table">
                    <table>
                        <thead>
                            <tr>
                                <th className="quynh-shift-col">Shifts</th>
                                {days.map(d => (
                                    <th key={d.day} className="quynh-day-header">{d.day}<br />{d.date}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.map(shift => (
                                <tr key={shift.name}>
                                    <td className="quynh-shift-info">
                                        <strong>{shift.name}</strong>
                                        <div className="quynh-shift-time">{shift.time}</div>
                                    </td>
                                    {days.map(d => {
                                        const shiftDetails = getShiftDetails(d, shift.name);
                                        const statusClass = shiftDetails
                                            ? `quynh-status-${shiftDetails.status.toLowerCase().replace(' ', '-')}`
                                            : "";

                                        return (
                                            <td
                                                key={d.day + shift.name}
                                                className={`quynh-day-cell ${shiftDetails ? "quynh-assigned" : ""} ${statusClass}`}
                                            >
                                                {shiftDetails ? (
                                                    <span className="quynh-status-text">{shiftDetails.status}</span>
                                                ) : (
                                                    "--"
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/*  Modal yêu cầu đổi ca */}
            <ChangeShiftModal
                isOpen={showChangeShiftModal}
                onClose={() => setShowChangeShiftModal(false)}
                onSuccess={handleRequestSuccess}
            />

            {/*  Modal yêu cầu nghỉ phép */}
            <LeaveRequestModal
                isOpen={showLeaveRequestModal}
                onClose={() => setShowLeaveRequestModal(false)}
                onSuccess={handleRequestSuccess}
            />

            {/*  Tab lịch sử các yêu cầu */}
            {activeTab === "historyRequest" && <HistoryRequest key={requestVersion} />}
        </div>
    );
}
