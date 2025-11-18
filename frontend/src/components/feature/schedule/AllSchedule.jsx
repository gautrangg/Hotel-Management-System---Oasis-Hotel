import React, { useState } from "react";
import "@assets/schedule/ScheduleManagement.css";
import { useNavigate } from "react-router-dom";
import useSchedule from "@hooks/useSchedule";

function groupByShiftAndDate(schedules) {
    const grouped = {};
    schedules.forEach((item) => {
        const shiftId = item.shiftId;
        const workDate = item.workDate;

        if (!grouped[shiftId]) {
            grouped[shiftId] = { shiftName: item.shiftName, startTime: item.startTime, endTime: item.endTime, dates: {} };
        }
        if (!grouped[shiftId].dates[workDate]) {
            grouped[shiftId].dates[workDate] = [];
        }
        grouped[shiftId].dates[workDate].push(item);
    });
    return grouped;
}

function generateWeeks(pastCount = 4, futureCount = 4) {
    const weeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monday = new Date(today);
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(today.getDate() + diff);

    for (let i = pastCount; i > 0; i--) {
        const start = new Date(monday);
        start.setDate(monday.getDate() - i * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        weeks.push(formatWeek(start, end, "Past"));
    }

    const currentStart = new Date(monday);
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentStart.getDate() + 6);
    weeks.push(formatWeek(currentStart, currentEnd, "Current"));

    for (let i = 1; i <= futureCount; i++) {
        const start = new Date(monday);
        start.setDate(monday.getDate() + i * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        weeks.push(formatWeek(start, end, "Upcoming"));
    }

    return weeks;
}

function formatDate(d) {
    return d.toLocaleDateString("en-CA");
}

function formatWeek(start, end, label) {
    return {
        start: formatDate(start),
        end: formatDate(end),
        label: `${start.getDate().toString().padStart(2, "0")}-${start.getMonth() + 1}-${start.getFullYear()} → ${end.getDate().toString().padStart(2, "0")}-${end.getMonth() + 1}-${end.getFullYear()} (${label})`
    };
}

export default function AllSchedule() {

    const navigate = useNavigate();
    const allWeeks = generateWeeks(50, 50);
    const allComingWeeks = generateWeeks(0, 4);

    const [week, setWeek] = useState(allWeeks.find(w => w.label.includes("Current")));
    const { schedules, refetch, getAuthHeaders } = useSchedule(week.start, week.end);
    const grouped = groupByShiftAndDate(schedules);

    const [showCreate, setShowCreate] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState(allComingWeeks[0]);
    const [isCreating, setIsCreating] = useState(false);
    const [message, setMessage] = useState("");

    const toggleCreateSchedule = () => {
        setShowCreate((prev) => !prev);
        setMessage("");
    };

    const handleCreateSchedule = async () => {
        try {
            setIsCreating(true);
            setMessage("");

            const url = `http://localhost:8080/api/schedules/create-week?start=${selectedWeek.start}&end=${selectedWeek.end}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage(`Successfully created ${data.created} schedules!`);

                if (selectedWeek.start === week.start) {
                    refetch();
                }

                setTimeout(() => {
                    setShowCreate(false);
                    setMessage("");
                }, 2000);
            } else {
                setMessage(`${data.message || "Failed to create schedule"}`);
            }
        } catch (error) {
            console.error("Error creating schedule:", error);
            setMessage(`Error: ${error.message || "Failed to create schedule"}`);
        } finally {
            setIsCreating(false);
        }
    };

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(week.start);
        d.setDate(d.getDate() + i);
        return formatDate(d);
    });

    return (
        <div className="t-schedule-container">
            {/* Header */}
            <h2 className="t-schedule-month">Schedule Management</h2>
            <div className="t-schedule-header">
                <div className="t-schedule-header-left">
                    <h2 className="t-schedule-month">Week</h2>
                    <div className="t-schedule-week-controls">
                        <button
                            onClick={() => {
                                const currentIndex = allWeeks.findIndex(w => w.start === week.start);
                                if (currentIndex > 0) {
                                    setWeek(allWeeks[currentIndex - 1]);
                                }
                                setShowCreate(false);
                            }}
                            className="btn"
                        >
                            &lt;
                        </button>

                        <select
                            className="t-schedule-week-select"
                            value={`${week.start} to ${week.end}`}
                            onChange={(e) => {
                                const [startStr, endStr] = e.target.value.split(" to ");
                                const foundWeek = allWeeks.find(w => w.start === startStr && w.end === endStr);
                                if (foundWeek) setWeek(foundWeek);
                            }}
                        >
                            {allWeeks.map((w, idx) => (
                                <option key={idx} value={`${w.start} to ${w.end}`}>
                                    {w.label}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => {
                                const currentIndex = allWeeks.findIndex(w => w.start === week.start);
                                if (currentIndex < allWeeks.length - 1) {
                                    setWeek(allWeeks[currentIndex + 1]);
                                }
                                setShowCreate(false);
                            }}
                            className="btn"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
                <div className="t-schedule-header-right">
                    <button
                        className="t-schedule-create-btn"
                        onClick={toggleCreateSchedule}
                    >
                        {showCreate ? "Close" : "Create Schedule"}
                    </button>
                    <div
                        className="t-schedule-create-btn"
                        onClick={() =>
                            navigate(`/staff/schedules/schedule-request`)
                        }
                    >
                        Schedule Request
                    </div>
                </div>
            </div>

            <div className={`t-schedule-create-panel ${showCreate ? "open" : ""}`}>
                <div className="t-schedule-create-content">
                    <h3>Create New Schedule</h3>
                    {message && (
                        <div className={`t-schedule-message error`}>
                            {message}
                        </div>
                    )}
                    <div className="t-schedule-create-row">

                        <label>Week:</label>
                        <select
                            value={`${selectedWeek.start} to ${selectedWeek.end}`}
                            onChange={(e) => {
                                const [startStr, endStr] = e.target.value.split(" to ");
                                const foundWeek = allComingWeeks.find(w => w.start === startStr && w.end === endStr);
                                if (foundWeek) {
                                    setSelectedWeek(foundWeek);
                                }
                            }}
                            disabled={isCreating}
                        >
                            {allComingWeeks.map((w, idx) => (
                                <option key={idx} value={`${w.start} to ${w.end}`}>
                                    {w.label}
                                </option>
                            ))}
                        </select>
                        <button
                            className="t-schedule-create-submit"
                            onClick={handleCreateSchedule}
                            disabled={isCreating}
                        >
                            {isCreating ? "Creating..." : "Create"}
                        </button>
                    </div>

                </div>
            </div>

            <br />
            {/* Table */}
            <div className="t-schedule-table">
                <div className="t-schedule-table-header">
                    <div className="t-schedule-col t-schedule-shift-col">Shifts</div>
                    {weekDates.map((d, i) => {
                        const date = new Date(d);
                        const dayName = date.toLocaleString("en-US", { weekday: "short" });
                        return (
                            <div className="t-schedule-col" key={i}>
                                {dayName}
                                <br />
                                {String(date.getDate()).padStart(2, "0")}
                            </div>
                        );
                    })}
                </div>

                {Object.keys(grouped).map((shiftId) => {
                    const shift = grouped[shiftId];
                    return (
                        <div className="t-schedule-row" key={shiftId}>
                            <div className="t-schedule-shift-cell">
                                <div className="t-schedule-shift-name">{shift.shiftName}</div>
                                <div className="t-schedule-shift-time">
                                    {shift.startTime} - {shift.endTime}
                                </div>
                            </div>

                            {weekDates.map((date) => {
                                const staffList = shift.dates[date] || [];
                                if (staffList.length === 0)
                                    return (
                                        <div className="t-schedule-cell" key={date}>
                                            <div className="t-schedule-empty">—</div>
                                            <div className="t-schedule-cell-detail"
                                                onClick={() =>
                                                    navigate(`/staff/schedules/detail?date=${date}&shift=${shiftId}`)
                                                }
                                            >
                                                <i className='bx bx-calendar-plus'></i>
                                            </div>
                                        </div>
                                    );

                                const byRole = {};
                                staffList.forEach((s) => {
                                    const role = s.roleName;
                                    if (!byRole[role]) byRole[role] = 0;
                                    byRole[role]++;
                                });

                                return (
                                    <div
                                        className="t-schedule-cell"
                                        key={date}
                                    >
                                        {Object.keys(byRole).map((role) => (
                                            <div
                                                key={role}
                                                className={`t-schedule-staff t-schedule-${role
                                                    .toLowerCase()
                                                    .replace(/\s/g, "-")}`}
                                            >
                                                {byRole[role]} {role}
                                            </div>
                                        ))}
                                        <div className="t-schedule-cell-detail"
                                            onClick={() =>
                                                navigate(`/staff/schedules/detail?date=${date}&shift=${shiftId}`)
                                            }
                                        >
                                            <i className='bx bx-calendar-plus'></i>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}