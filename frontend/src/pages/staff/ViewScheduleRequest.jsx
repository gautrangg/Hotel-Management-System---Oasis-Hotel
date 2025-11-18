import React from "react";
import "@assets/schedule/StaffRequest.css";
import Sidebar from "@components/layout/Sidebar";
import Header from "@components/layout/Header";
import ScheduleRequest from "@components/feature/schedule/ScheduleRequest";

export default function ViewScheduleRequest() {
    return (
        <div className="schedule-dashboard">
            <Header />
            <Sidebar />
            <div className="schedule-main-content">
                <ScheduleRequest />
            </div>
        </div>
    );
}
