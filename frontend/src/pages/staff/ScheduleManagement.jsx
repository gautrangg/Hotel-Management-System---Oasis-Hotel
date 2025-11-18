import React from "react";
import "@assets/schedule/ScheduleManagement.css";

import Sidebar from "@components/layout/Sidebar"
import Header from "@components/layout/Header"

import AllSchedule from "@components/feature/schedule/AllSchedule"


export default function ScheduleManagement() {

    return (
        <div className="staff-dashboard">
            <Header />
            <Sidebar />
            <div className="staff-main-content">
                <AllSchedule />
            </div>
        </div>
    );
}
