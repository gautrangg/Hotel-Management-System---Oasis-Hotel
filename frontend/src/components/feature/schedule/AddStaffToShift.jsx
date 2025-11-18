import React, { useEffect, useState } from "react";
import "@assets/schedule/AddStaffToShift.css";
import Swal from "sweetalert2";

export default function AddStaffToShift({ date, shiftId, shiftName, onClose, onAddSuccess }) {
    const [staffGroups, setStaffGroups] = useState({});
    const [selected, setSelected] = useState([]);

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const token = localStorage.getItem("token");


    useEffect(() => {

        const fetchAvailableStaff = async () => {
            if (!shiftId || !date) return;

            console.log("🔄 Fetching available staff...");
            try {
                const res = await fetch(`http://localhost:8080/api/schedules/available-staff?shiftId=${shiftId}&date=${date}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const text = await res.text();
                if (!text) {
                    console.warn("Empty response body from server");
                    setStaffGroups({});
                    return;
                }

                const data = JSON.parse(text);
                console.log("Available staff response:", data);
                setStaffGroups(data || {});
            } catch (err) {
                console.error("Load available staff failed:", err);
                setStaffGroups({}); 
            }
        };

        fetchAvailableStaff();

    }, [shiftId, date, token, refreshTrigger]);


    const toggleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((s) => s !== id)
                : [...prev, id]
        );
    };

    const handleAdd = async () => {
        if (selected.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "No staff selected",
                text: "Please select at least one staff to add.",
                confirmButtonColor: "#3085d6",
            });

            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/schedules/add-staff", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    shiftId: Number(shiftId),
                    workDate: date,
                    staffIds: selected.map(id => Number(id))
                })
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            await res.json();
            console.log("Add staff success");
            Swal.fire({
                icon: "success",
                title: "Add staff success!",
                showConfirmButton: false,
                timer: 1500,
            });


            onAddSuccess();
            setSelected([]);

            setRefreshTrigger(current => current + 1);

        } catch (err) {
            console.error("Add staff failed:", err);
            Swal.fire({
                icon: "error",
                title: "Add staff failed",
                text: err.message,
                confirmButtonColor: "#d33",
            });

        }
    };

    return (
        <>
            <div className="t-schedule-sidebar-container">
                
                <button className="t-attendance-close-btn" onClick={onClose}>
                    ✖
                </button>

                <h2 className="t-attendance-title">
                    Add Staff to Shift: {shiftName.split("(")[0]} {date}
                </h2>

                <div className="t-addstaff-list">
                    {Object.keys(staffGroups).length === 0 ? (
                        <p>No available staff to add.</p>
                    ) : (
                        Object.keys(staffGroups).map((role) => (
                            <div key={role} className="t-addstaff-role-group">
                                <h3>{role}</h3>
                                {staffGroups[role].map((s) => (
                                    <div key={s.staffId} className="t-addstaff-card">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(s.staffId)}
                                            onChange={() => toggleSelect(s.staffId)}
                                        />
                                        <img
                                            src={`http://localhost:8080/upload/avatar/${s.staffImage}`}
                                            alt={s.fullName}
                                            className="t-addstaff-avatar"
                                        />
                                        <div className="t-addstaff-info">
                                            <strong>{s.fullName}</strong>
                                            <p>{s.email}</p>
                                        </div>
                                        <span className="t-addstaff-phone">{s.phone}</span>
                                    </div>
                                ))
                                }
                            </div>
                        ))
                    )}

                </div>

                <button className="t-addstaff-add-btn" onClick={handleAdd}>Add</button>
            </div>
        </>
    );
}